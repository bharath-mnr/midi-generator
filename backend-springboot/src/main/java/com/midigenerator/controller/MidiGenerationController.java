// //midigenerator/controller/MidiGenerationController.java
// package com.midigenerator.controller;

// import com.midigenerator.dto.generation.*;
// import com.midigenerator.entity.MidiGeneration;
// import com.midigenerator.service.*;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.*;

// @RestController
// @RequestMapping("/api/midi")
// @RequiredArgsConstructor
// // @CrossOrigin(origins = "*", maxAge = 3600)
// public class MidiGenerationController {

//     private final MidiGenerationProxyService proxyService;
//     private final MidiGenerationService midiGenerationService;

//     @PostMapping("/generate")
//     public ResponseEntity<Map<String, Object>> generateMidi(@Valid @RequestBody GenerationRequest request) {
//         return ResponseEntity.ok(proxyService.generateMidi(request));
//     }

//     @PostMapping("/upload-midi")
//     public ResponseEntity<Map<String, Object>> uploadMidi(@RequestBody Map<String, Object> uploadRequest) {
//         return ResponseEntity.ok(proxyService.uploadMidi(uploadRequest));
//     }

//     @GetMapping("/generations")
//     public ResponseEntity<Page<MidiGeneration>> getUserGenerations(
//             @RequestParam(defaultValue = "0") int page,
//             @RequestParam(defaultValue = "10") int size) {
//         return ResponseEntity.ok(midiGenerationService.getUserGenerations(page, size));
//     }

//     @GetMapping("/generations/{id}")
//     public ResponseEntity<MidiGeneration> getGenerationById(@PathVariable Long id) {
//         return ResponseEntity.ok(midiGenerationService.getGenerationById(id));
//     }

//     @DeleteMapping("/generations/{id}")
//     public ResponseEntity<Map<String, String>> deleteGeneration(@PathVariable Long id) {
//         midiGenerationService.deleteGeneration(id);
//         Map<String, String> response = new HashMap<>();
//         response.put("message", "Generation deleted successfully");
//         return ResponseEntity.ok(response);
//     }
// }








package com.midigenerator.controller;

import com.midigenerator.dto.generation.*;
import com.midigenerator.entity.MidiGeneration;
import com.midigenerator.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * ✅ UNIFIED CONTROLLER: All MIDI operations in one place
 * Handles generation, upload, download, and history
 */
@Slf4j
@RestController
@RequestMapping("/api/midi")
@RequiredArgsConstructor
public class MidiGenerationController {

    private final MidiGenerationProxyService proxyService;
    private final MidiGenerationService midiGenerationService;
    private final RestTemplate restTemplate;

    @Value("${midi.generator.url:http://localhost:5000/api}")
    private String nodeServerUrl;

    // ========================================================================
    // GENERATION ENDPOINTS
    // ========================================================================

    /**
     * Generate new MIDI composition
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateMidi(
            @Valid @RequestBody GenerationRequest request) {
        return ResponseEntity.ok(proxyService.generateMidi(request));
    }

    /**
     * Upload MIDI file for editing
     */
    @PostMapping("/upload-midi")
    public ResponseEntity<Map<String, Object>> uploadMidi(
            @RequestBody Map<String, Object> uploadRequest) {
        return ResponseEntity.ok(proxyService.uploadMidi(uploadRequest));
    }

    // ========================================================================
    // DOWNLOAD ENDPOINT (On-Demand Conversion)
    // ========================================================================

    /**
     * ✅ Download MIDI by ID with on-demand text-to-binary conversion
     * 
     * Flow:
     * 1. Fetch text MIDI from database (by ID)
     * 2. Convert to binary via Node.js /api/text-to-midi
     * 3. Stream binary file to client
     * 
     * Benefits:
     * - No physical files stored
     * - Always fresh conversion
     * - User ownership verified
     */
    @GetMapping("/download/{generationId}")
    public ResponseEntity<Resource> downloadMidiById(@PathVariable Long generationId) {
        log.info("🎵 MIDI Download Request - Generation ID: {}", generationId);

        try {
            // Step 1: Fetch generation (with ownership check)
            MidiGeneration generation = midiGenerationService.getGenerationById(generationId);
            
            // Step 2: Validate text MIDI exists
            String textMidi = generation.getTextMidi();
            if (textMidi == null || textMidi.trim().isEmpty()) {
                log.error("❌ Text MIDI not found for generation: {}", generationId);
                return ResponseEntity.notFound().build();
            }

            log.info("📄 Retrieved text MIDI: {} characters", textMidi.length());

            // Step 3: Convert to binary via Node.js
            byte[] midiBytes = convertTextToBinary(textMidi);

            if (midiBytes == null || midiBytes.length < 14) {
                log.error("❌ Invalid MIDI binary generated");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
            }

            log.info("✅ Converted to binary: {} bytes", midiBytes.length);

            // Step 4: Validate MIDI header
            if (midiBytes.length >= 4) {
                String header = new String(midiBytes, 0, 4);
                if (!"MThd".equals(header)) {
                    log.warn("⚠️ Invalid MIDI header: {}", header);
                }
            }

            // Step 5: Update last access timestamp
            generation.updateLastAccessed();

            // Step 6: Stream to client
            ByteArrayResource resource = new ByteArrayResource(midiBytes);
            String filename = generation.getFileName() != null ? 
                             generation.getFileName() : 
                             "composition_" + generationId + ".mid";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/midi"))
                    .contentLength(midiBytes.length)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(resource);

        } catch (Exception e) {
            log.error("❌ Download failed for generation {}: {}", generationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ✅ Converts text MIDI notation to binary .mid format
     * Calls Node.js /api/text-to-midi endpoint
     */
    private byte[] convertTextToBinary(String textMidi) {
        try {
            log.info("🔄 Converting text MIDI to binary...");

            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(HttpHeaders.ACCEPT, "audio/midi");

            Map<String, Object> request = new HashMap<>();
            request.put("text", textMidi);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            // Call Node.js conversion endpoint
            String endpoint = nodeServerUrl + "/text-to-midi";
            log.info("📡 Calling Node.js: {}", endpoint);

            ResponseEntity<byte[]> response = restTemplate.postForEntity(
                    endpoint, 
                    entity, 
                    byte[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                byte[] midiBytes = response.getBody();
                log.info("✅ Conversion successful: {} bytes", midiBytes.length);
                return midiBytes;
            } else {
                log.error("❌ Node.js returned status: {}", response.getStatusCode());
                return null;
            }

        } catch (RestClientException e) {
            log.error("❌ Node.js connection failed: {}", e.getMessage());
            throw new RuntimeException("MIDI conversion service unavailable: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Unexpected conversion error: {}", e.getMessage(), e);
            return null;
        }
    }

    // ========================================================================
    // HISTORY ENDPOINTS
    // ========================================================================

    /**
     * Get user's MIDI generations (paginated)
     */
    @GetMapping("/generations")
    public ResponseEntity<Page<MidiGeneration>> getUserGenerations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(midiGenerationService.getUserGenerations(page, size));
    }

    /**
     * Get specific generation by ID
     */
    @GetMapping("/generations/{id}")
    public ResponseEntity<MidiGeneration> getGenerationById(@PathVariable Long id) {
        return ResponseEntity.ok(midiGenerationService.getGenerationById(id));
    }

    /**
     * Delete a generation
     */
    @DeleteMapping("/generations/{id}")
    public ResponseEntity<Map<String, String>> deleteGeneration(@PathVariable Long id) {
        midiGenerationService.deleteGeneration(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Generation deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ========================================================================
    // HEALTH CHECK
    // ========================================================================

    /**
     * Health check endpoint for debugging
     */
    @GetMapping("/health-check")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "MIDI Generation Controller");
        response.put("nodeServerUrl", nodeServerUrl);
        response.put("status", "active");
        response.put("mode", "database-storage");
        response.put("timestamp", System.currentTimeMillis());

        // Test Node.js connection
        try {
            String healthUrl = nodeServerUrl + "/health";
            ResponseEntity<String> nodeResponse = restTemplate.getForEntity(healthUrl, String.class);
            response.put("nodejsStatus", nodeResponse.getStatusCode().toString());
            response.put("nodejsHealthy", true);
        } catch (Exception e) {
            response.put("nodejsStatus", "unreachable");
            response.put("nodejsHealthy", false);
            response.put("nodejsError", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}