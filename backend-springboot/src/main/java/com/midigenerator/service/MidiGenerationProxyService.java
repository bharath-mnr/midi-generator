//midigenerator/service/MidiGenerationProxyService.java
package com.midigenerator.service;

import com.midigenerator.dto.generation.*;
import com.midigenerator.entity.*;
import com.midigenerator.exception.*;
import com.midigenerator.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // ✅ SECURITY FIX: Maximum retry attempts for optimistic locking
    private static final int MAX_RETRY_ATTEMPTS = 3;

    @Transactional
    public Map<String, Object> generateMidi(GenerationRequest request) {
        // ✅ SECURITY FIX: Retry logic for optimistic locking failures
        int retryCount = 0;
        while (retryCount < MAX_RETRY_ATTEMPTS) {
            try {
                return attemptGenerateMidi(request);
            } catch (ObjectOptimisticLockingFailureException e) {
                retryCount++;
                log.warn("⚠️ Optimistic locking conflict, retry attempt {}/{}", retryCount, MAX_RETRY_ATTEMPTS);
                if (retryCount >= MAX_RETRY_ATTEMPTS) {
                    log.error("❌ Maximum retry attempts reached for generation");
                    throw new RuntimeException("System is busy, please try again in a moment");
                }
                // Brief pause before retry
                try {
                    Thread.sleep(100 * retryCount); // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Generation interrupted");
                }
            }
        }
        throw new RuntimeException("Failed to process generation request");
    }

    private Map<String, Object> attemptGenerateMidi(GenerationRequest request) {
        User user = userService.getCurrentUser();

        // ✅ STEP 1: Validate and sanitize all user inputs FIRST
        try {
            // Validate message for XSS
            sanitizationService.validateInput(request.getMessage());

            // Validate original content if present
            if (request.getOriginalContent() != null && !request.getOriginalContent().isEmpty()) {
                sanitizationService.validateInput(request.getOriginalContent());
            }

            // ✅ FIX: Enhanced MIDI file validation
            if (request.getUploadedMidiFilename() != null && !request.getUploadedMidiFilename().isEmpty()) {
                log.info("🎼 Validating uploaded MIDI: {}", request.getUploadedMidiFilename());

                // Validate filename
                sanitizationService.validateFilename(request.getUploadedMidiFilename());

                // Validate MIDI data if present
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
            throw e; // Will be handled by GlobalExceptionHandler
        }

        // ✅ STEP 2: Check email verification
        if (!user.getEmailVerified()) {
            log.warn("User {} attempted to generate without email verification", user.getEmail());
            throw new RuntimeException("Please verify your email before generating music.");
        }

        // ✅ STEP 3: Check generation limit BEFORE incrementing
        if (!user.canGenerateMore()) {
            log.warn("User {} exceeded daily generation limit", user.getEmail());
            throw new GenerationLimitExceededException(
                    String.format("Daily limit reached (%d/%d). Upgrade your plan.",
                            user.getDailyGenerationCount(),
                            user.getSubscriptionTier().getDailyLimit())
            );
        }

        // ✅ SECURITY FIX: Increment generation count with optimistic locking
        user.incrementGenerationCount();
        user = userRepository.save(user);

        log.info("✅ User {} generation count: {}/{}",
                user.getEmail(),
                user.getDailyGenerationCount(),
                user.getSubscriptionTier().getDailyLimit());

        try {
            String originalContentToUse = request.getOriginalContent();

            // ✅ FIX: Better MIDI upload handling
            if (request.getUploadedMidiData() != null && !request.getUploadedMidiData().trim().isEmpty()) {
                String cleanedFilename = sanitizationService.cleanFilename(request.getUploadedMidiFilename());
                log.info("📤 Processing uploaded MIDI file: {} (cleaned: {})",
                        request.getUploadedMidiFilename(), cleanedFilename);

                try {
                    Map<String, Object> uploadResult = uploadMidiInternal(request.getUploadedMidiData());

                    if (uploadResult.containsKey("textMidi")) {
                        originalContentToUse = (String) uploadResult.get("textMidi");

                        @SuppressWarnings("unchecked")
                        Map<String, Object> stats = (Map<String, Object>) uploadResult.get("stats");
                        Integer bars = stats != null ? (Integer) stats.get("bars") : null;

                        log.info("✅ Converted uploaded MIDI to text ({} bars)", bars);
                        request.setEditMode(true);
                    } else {
                        log.warn("⚠️ Upload result missing textMidi field");
                        throw new RuntimeException("Failed to convert MIDI file to text format");
                    }
                } catch (Exception e) {
                    log.error("❌ Failed to process uploaded MIDI: {}", e.getMessage(), e);
                    rollbackGenerationCount(user);
                    throw new RuntimeException("Failed to process MIDI file: " + e.getMessage());
                }
            }

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

            String nodeEndpoint = nodeServerUrl + "/chat";
            log.info("📤 Forwarding to Node.js: {}", nodeEndpoint);

            ResponseEntity<Map> response;
            try {
                response = restTemplate.postForEntity(nodeEndpoint, entity, Map.class);
                log.info("✅ Node.js response status: {}", response.getStatusCode());
            } catch (RestClientException e) {
                log.error("❌ Node.js connection failed: {}", e.getMessage());
                rollbackGenerationCount(user);
                throw new RuntimeException("Failed to connect to MIDI generation service: " + e.getMessage());
            }

            Map<String, Object> nodeResponse = response.getBody();
            if (nodeResponse == null || nodeResponse.isEmpty()) {
                rollbackGenerationCount(user);
                throw new RuntimeException("Empty response from MIDI generator");
            }

            if (nodeResponse.containsKey("error")) {
                rollbackGenerationCount(user);
                throw new RuntimeException("Generation error: " + nodeResponse.get("error"));
            }

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
                String filename = nodeMidiPath.substring(nodeMidiPath.lastIndexOf('/') + 1);
                fullMidiUrl = baseUrl + "/api/midi-files/" + filename;
                log.info("🎵 MIDI URL (via proxy): {}", fullMidiUrl);
            }

            generation.setMidiUrl(fullMidiUrl);
            generation.setGeneratedAt(LocalDateTime.now());

            MidiGeneration saved = midiGenerationRepository.save(generation);
            log.info("💾 Saved MIDI generation with ID: {} from {}", saved.getId(), saved.getSource());

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
                    chat.setGeneratedBars(barCount);
                    chat.setMidiUrl(fullMidiUrl);
                    chat.setSource(request.getSource());
                    chatHistoryRepository.save(chat);
                    log.info("💬 Saved chat history from {}", request.getSource());
                } catch (Exception e) {
                    log.error("⚠️ Failed to save chat history: {}", e.getMessage());
                }
            }

            Map<String, Object> enhancedResponse = new HashMap<>(nodeResponse);
            enhancedResponse.put("id", saved.getId());
            enhancedResponse.put("midiUrl", fullMidiUrl);
            enhancedResponse.put("remainingGenerations", user.getRemainingGenerations());
            enhancedResponse.put("limitReached", !user.canGenerateMore());
            enhancedResponse.put("source", saved.getSource());
            enhancedResponse.put("limitMessage", user.canGenerateMore() ? null :
                    "Daily limit reached. Upgrade for more generations.");

            log.info("🎉 Generation complete! Remaining: {}", user.getRemainingGenerations());

            return enhancedResponse;

        } catch (GenerationLimitExceededException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ MIDI generation failed: {}", e.getMessage(), e);
            rollbackGenerationCount(user);
            throw new RuntimeException("Failed to generate MIDI: " + e.getMessage());
        }
    }

    // ✅ SECURITY FIX: Safe rollback method with retry logic
    private void rollbackGenerationCount(User user) {
        int retryCount = 0;
        while (retryCount < MAX_RETRY_ATTEMPTS) {
            try {
                // Refresh user from database to get latest version
                User freshUser = userRepository.findById(user.getId())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                freshUser.setDailyGenerationCount(Math.max(0, freshUser.getDailyGenerationCount() - 1));
                userRepository.save(freshUser);
                log.info("✅ Rolled back generation count for user: {}", freshUser.getEmail());
                return;
            } catch (ObjectOptimisticLockingFailureException e) {
                retryCount++;
                log.warn("⚠️ Rollback conflict, retry attempt {}/{}", retryCount, MAX_RETRY_ATTEMPTS);
                if (retryCount >= MAX_RETRY_ATTEMPTS) {
                    log.error("❌ Failed to rollback generation count after {} attempts", MAX_RETRY_ATTEMPTS);
                    return;
                }
                try {
                    Thread.sleep(50 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return;
                }
            } catch (Exception e) {
                log.error("❌ Unexpected error during rollback: {}", e.getMessage());
                return;
            }
        }
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