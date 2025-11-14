package com.midigenerator.service;

import com.midigenerator.dto.generation.*;
import com.midigenerator.entity.*;
import com.midigenerator.exception.*;
import com.midigenerator.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MidiGenerationProxyService {

    private final InputSanitizationService sanitizationService;
    private final UserRepository userRepository;
    private final MidiGenerationRepository midiGenerationRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final UserService userService;
    private final RestTemplate restTemplate;

    @Value("${midi.generator.url:http://localhost:5000/api}")
    private String nodeServerUrl;

    // ✅ NEW: Node.js base URL for direct file access
    @Value("${midi.generator.base-url:http://localhost:5000}")
    private String nodeServerBaseUrl;

    /**
     * Main entry point for MIDI generation with proper transaction handling
     */
    @Transactional
    public Map<String, Object> generateMidi(GenerationRequest request) {
        User user = userService.getCurrentUser();

        // Validate inputs first
        validateGenerationRequest(request, user);

        // Use pessimistic lock to prevent concurrent updates
        User lockedUser = userRepository.findByIdWithLock(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check email verification
        if (!lockedUser.getEmailVerified()) {
            log.warn("User {} attempted to generate without email verification", lockedUser.getEmail());
            throw new RuntimeException("Please verify your email before generating music.");
        }

        // Check generation limit with locked user
        if (!lockedUser.canGenerateMore()) {
            log.warn("User {} exceeded daily generation limit", lockedUser.getEmail());
            throw new GenerationLimitExceededException(
                    String.format("Daily limit reached (%d/%d). Upgrade your plan.",
                            lockedUser.getDailyGenerationCount(),
                            lockedUser.getSubscriptionTier().getDailyLimit())
            );
        }

        // Increment and flush immediately
        lockedUser.incrementGenerationCount();
        lockedUser = userRepository.saveAndFlush(lockedUser);

        log.info("✅ User {} generation count: {}/{}",
                lockedUser.getEmail(),
                lockedUser.getDailyGenerationCount(),
                lockedUser.getSubscriptionTier().getDailyLimit());

        try {
            return performGeneration(request, lockedUser);
        } catch (GenerationLimitExceededException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ MIDI generation failed: {}", e.getMessage(), e);
            lockedUser.decrementGenerationCount();
            userRepository.saveAndFlush(lockedUser);
            log.info("✅ Rolled back generation count for user: {}", lockedUser.getEmail());
            throw new RuntimeException("Failed to generate MIDI: " + e.getMessage());
        }
    }

    private void validateGenerationRequest(GenerationRequest request, User user) {
        try {
            sanitizationService.validateInput(request.getMessage());

            if (request.getOriginalContent() != null && !request.getOriginalContent().isEmpty()) {
                sanitizationService.validateInput(request.getOriginalContent());
            }

            if (request.getUploadedMidiFilename() != null && !request.getUploadedMidiFilename().isEmpty()) {
                log.info("🎼 Validating uploaded MIDI: {}", request.getUploadedMidiFilename());
                sanitizationService.validateFilename(request.getUploadedMidiFilename());

                if (request.getUploadedMidiData() != null && !request.getUploadedMidiData().isEmpty()) {
                    sanitizationService.validateMidiData(request.getUploadedMidiData());
                    log.info("✅ MIDI data validated - Size: {} bytes", request.getUploadedMidiData().length());
                } else {
                    log.warn("⚠️ Filename provided but no MIDI data");
                    throw new IllegalArgumentException("MIDI filename provided but no file data received");
                }
            }
        } catch (IllegalArgumentException e) {
            log.warn("Input validation failed for user {}: {}", user.getEmail(), e.getMessage());
            throw e;
        }
    }

    private Map<String, Object> performGeneration(GenerationRequest request, User user) {
        String originalContentToUse = request.getOriginalContent();

        // Handle MIDI upload if present
        if (request.getUploadedMidiData() != null && !request.getUploadedMidiData().trim().isEmpty()) {
            originalContentToUse = processMidiUpload(request);
        }

        // Prepare request for Node.js service
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> nodeRequest = new HashMap<>();
        nodeRequest.put("message", request.getMessage());
        nodeRequest.put("creativityLevel", request.getCreativityLevel());
        nodeRequest.put("performanceMode", request.getPerformanceMode());
        nodeRequest.put("requestedBars", request.getRequestedBars());
        nodeRequest.put("editMode", request.getEditMode());
        nodeRequest.put("originalContent", originalContentToUse);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(nodeRequest, headers);

        // Call Node.js generation service
        String nodeEndpoint = nodeServerUrl + "/chat";
        log.info("📤 Forwarding to Node.js: {}", nodeEndpoint);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(nodeEndpoint, entity, Map.class);
            log.info("✅ Node.js response status: {}", response.getStatusCode());
        } catch (RestClientException e) {
            log.error("❌ Node.js connection failed: {}", e.getMessage());
            throw new RuntimeException("Failed to connect to MIDI generation service: " + e.getMessage());
        }

        Map<String, Object> nodeResponse = response.getBody();
        if (nodeResponse == null || nodeResponse.isEmpty()) {
            throw new RuntimeException("Empty response from MIDI generator");
        }

        if (nodeResponse.containsKey("error")) {
            throw new RuntimeException("Generation error: " + nodeResponse.get("error"));
        }

        // Save generation record
        MidiGeneration saved = saveMidiGeneration(request, user, nodeResponse);

        // Save chat history if session ID provided
        saveChatHistory(request, user, nodeResponse, saved);

        // Build enhanced response
        return buildEnhancedResponse(nodeResponse, saved, user);
    }

    private String processMidiUpload(GenerationRequest request) {
        String cleanedFilename = sanitizationService.cleanFilename(request.getUploadedMidiFilename());
        log.info("📤 Processing uploaded MIDI file: {} (cleaned: {})",
                request.getUploadedMidiFilename(), cleanedFilename);

        try {
            Map<String, Object> uploadResult = uploadMidiInternal(request.getUploadedMidiData());

            if (uploadResult.containsKey("textMidi")) {
                String textMidi = (String) uploadResult.get("textMidi");

                @SuppressWarnings("unchecked")
                Map<String, Object> stats = (Map<String, Object>) uploadResult.get("stats");
                Integer bars = stats != null ? (Integer) stats.get("bars") : null;

                log.info("✅ Converted uploaded MIDI to text ({} bars)", bars);
                request.setEditMode(true);

                return textMidi;
            } else {
                log.warn("⚠️ Upload result missing textMidi field");
                throw new RuntimeException("Failed to convert MIDI file to text format");
            }
        } catch (Exception e) {
            log.error("❌ Failed to process uploaded MIDI: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process MIDI file: " + e.getMessage());
        }
    }

    /**
     * ✅ FIXED: Save MIDI generation with correct URL pointing to Node.js server
     */
    private MidiGeneration saveMidiGeneration(GenerationRequest request, User user, Map<String, Object> nodeResponse) {
        MidiGeneration generation = new MidiGeneration();
        generation.setUser(user);
        generation.setFileName("generated_" + System.currentTimeMillis() + ".mid");
        generation.setOriginalPrompt(request.getMessage());
        generation.setCreativityLevel(request.getCreativityLevel());
        generation.setPerformanceMode(request.getPerformanceMode());
        generation.setIsEdited(request.getEditMode());
        generation.setSource(request.getSource());

        Integer barCount = nodeResponse.get("barCount") != null ?
                ((Number) nodeResponse.get("barCount")).intValue() : null;
        generation.setBarCount(barCount);
        generation.setTextMidi((String) nodeResponse.get("message"));

        String nodeMidiPath = (String) nodeResponse.get("midiUrl");
        String fullMidiUrl = null;

        if (nodeMidiPath != null) {
            // ✅ FIXED: Extract filename and create direct Node.js URL
            String filename = nodeMidiPath.substring(nodeMidiPath.lastIndexOf('/') + 1);
            
            // Remove /api from base URL if present for file serving
            String fileBaseUrl = nodeServerBaseUrl;
            if (fileBaseUrl.endsWith("/api")) {
                fileBaseUrl = fileBaseUrl.substring(0, fileBaseUrl.length() - 4);
            }
            
            fullMidiUrl = fileBaseUrl + "/generated/" + filename;
            log.info("🎵 MIDI URL (direct to Node.js): {}", fullMidiUrl);
        }

        generation.setMidiUrl(fullMidiUrl);
        generation.setGeneratedAt(LocalDateTime.now());

        MidiGeneration saved = midiGenerationRepository.save(generation);
        log.info("💾 Saved MIDI generation with ID: {} from {}", saved.getId(), saved.getSource());

        return saved;
    }

    private void saveChatHistory(GenerationRequest request, User user, Map<String, Object> nodeResponse, MidiGeneration saved) {
        if (request.getSessionId() != null && !request.getSessionId().trim().isEmpty()) {
            try {
                ChatHistory chat = new ChatHistory();
                chat.setUser(user);
                chat.setSessionId(request.getSessionId());
                chat.setUserMessage(request.getMessage());
                chat.setBotResponse((String) nodeResponse.get("message"));
                chat.setMessageType(request.getEditMode() ?
                        ChatHistory.MessageType.EDIT :
                        ChatHistory.MessageType.GENERATE);
                chat.setRequestedBars(request.getRequestedBars());

                Integer barCount = nodeResponse.get("barCount") != null ?
                        ((Number) nodeResponse.get("barCount")).intValue() : null;
                chat.setGeneratedBars(barCount);
                chat.setMidiUrl(saved.getMidiUrl());
                chat.setSource(request.getSource());

                chatHistoryRepository.save(chat);
                log.info("💬 Saved chat history from {}", request.getSource());
            } catch (Exception e) {
                log.error("⚠️ Failed to save chat history: {}", e.getMessage());
            }
        }
    }

    private Map<String, Object> buildEnhancedResponse(Map<String, Object> nodeResponse, MidiGeneration saved, User user) {
        Map<String, Object> enhancedResponse = new HashMap<>(nodeResponse);
        enhancedResponse.put("id", saved.getId());
        enhancedResponse.put("midiUrl", saved.getMidiUrl());
        enhancedResponse.put("remainingGenerations", user.getRemainingGenerations());
        enhancedResponse.put("limitReached", !user.canGenerateMore());
        enhancedResponse.put("source", saved.getSource());
        enhancedResponse.put("limitMessage", user.canGenerateMore() ? null :
                "Daily limit reached. Upgrade for more generations.");

        log.info("🎉 Generation complete! Remaining: {}", user.getRemainingGenerations());

        return enhancedResponse;
    }

    public Map<String, Object> uploadMidi(Map<String, Object> uploadRequest) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(uploadRequest, headers);

            String nodeEndpoint = nodeServerUrl + "/upload-midi";
            ResponseEntity<Map> response = restTemplate.postForEntity(nodeEndpoint, entity, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("❌ MIDI upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload MIDI: " + e.getMessage());
        }
    }

    private Map<String, Object> uploadMidiInternal(String midiBase64Data) {
        try {
            Map<String, Object> uploadRequest = new HashMap<>();
            uploadRequest.put("midiData", midiBase64Data);
            return uploadMidi(uploadRequest);
        } catch (Exception e) {
            log.error("❌ Internal MIDI upload failed: {}", e.getMessage());
            throw new RuntimeException("Failed to process MIDI file: " + e.getMessage());
        }
    }
}
