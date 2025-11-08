// //midigenerator/controller/MidiProxyController.java
// package com.midigenerator.controller;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.core.io.ByteArrayResource;
// import org.springframework.core.io.Resource;
// import org.springframework.http.*;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.client.RestTemplate;

// import java.util.HashMap;
// import java.util.Map;

// @Slf4j
// @RestController
// @RequestMapping("/api/midi-files")
// @RequiredArgsConstructor
// public class MidiProxyController {

//     private final RestTemplate restTemplate;

//     @Value("${midi.generator.url:http://localhost:5000/api}")
//     private String nodeServerUrl;

//     @GetMapping("/{filename:.+}")
//     public ResponseEntity<Resource> getMidiFile(@PathVariable String filename) {
//         log.info("🎵 MIDI Download Request - Filename: {}", filename);
//         log.info("🔧 Node Server URL: {}", nodeServerUrl);

//         try {
//             // Validate filename
//             if (filename == null || filename.trim().isEmpty()) {
//                 log.error("❌ Invalid filename: empty or null");
//                 return ResponseEntity.badRequest().build();
//             }

//             // ✅ FIX: Construct correct URL for file downloads
//             // For file downloads, we need to remove "/api" since files are served at /generated/
//             // But keep /api for other endpoints like /api/chat
//             String baseUrl = nodeServerUrl;
//             if (baseUrl.contains("/api")) {
//                 baseUrl = baseUrl.replace("/api", "");
//             }

//             // Build Node.js URL for file download
//             String nodeUrl = baseUrl + "/generated/" + filename;
//             log.info("📡 Fetching from Node.js: {}", nodeUrl);

//             // Attempt to fetch from Node.js
//             ResponseEntity<byte[]> response;
//             try {
//                 response = restTemplate.getForEntity(nodeUrl, byte[].class);
//                 log.info("✅ Node.js response status: {}", response.getStatusCode());
//             } catch (org.springframework.web.client.ResourceAccessException e) {
//                 log.error("❌ Cannot connect to Node.js server at {}", baseUrl);
//                 log.error("❌ Error details: {}", e.getMessage());
//                 return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
//                         .body(null);
//             } catch (org.springframework.web.client.HttpClientErrorException e) {
//                 log.error("❌ Node.js returned error: {} - {}", e.getStatusCode(), e.getMessage());

//                 if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
//                     log.error("❌ File not found on Node.js server. Please check:");
//                     log.error("❌ 1. Node.js server is running on {}", baseUrl);
//                     log.error("❌ 2. File exists in Node.js generated directory: {}", filename);
//                     log.error("❌ 3. Node.js static file serving is configured for /generated/ endpoint");
//                 }

//                 return ResponseEntity.status(e.getStatusCode()).build();
//             }

//             // Check response
//             if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
//                 byte[] midiData = response.getBody();
//                 log.info("✅ MIDI file fetched successfully: {} bytes", midiData.length);

//                 // Validate MIDI data
//                 if (midiData.length < 14) { // Minimum valid MIDI file size
//                     log.error("❌ MIDI file too small: {} bytes", midiData.length);
//                     return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//                 }

//                 // Check if it's a valid MIDI file (starts with "MThd")
//                 if (midiData.length >= 4) {
//                     String header = new String(midiData, 0, 4);
//                     if (!"MThd".equals(header)) {
//                         log.warn("⚠️ Downloaded file may not be a valid MIDI file. Header: {}", header);
//                     }
//                 }

//                 ByteArrayResource resource = new ByteArrayResource(midiData);

//                 return ResponseEntity.ok()
//                         .contentType(MediaType.parseMediaType("audio/midi"))
//                         .contentLength(midiData.length)
//                         .header(HttpHeaders.CONTENT_DISPOSITION,
//                                 "attachment; filename=\"" + filename + "\"")
//                         .header(HttpHeaders.CACHE_CONTROL, "no-cache")
//                         .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
//                         .body(resource);
//             } else {
//                 log.error("❌ Failed to fetch MIDI - Status: {}, Has Body: {}",
//                         response.getStatusCode(),
//                         response.getBody() != null);
//                 return ResponseEntity.notFound().build();
//             }
//         } catch (Exception e) {
//             log.error("❌ Unexpected error fetching MIDI file: {}", filename);
//             log.error("❌ Error type: {}", e.getClass().getName());
//             log.error("❌ Error message: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//         }
//     }

//     // ✅ Health check endpoint for debugging
//     @GetMapping("/health-check")
//     public ResponseEntity<Map<String, Object>> healthCheck() {
//         Map<String, Object> response = new HashMap<>();
//         response.put("service", "MIDI Proxy Controller");
//         response.put("nodeServerUrl", nodeServerUrl);
//         response.put("status", "active");
//         response.put("timestamp", System.currentTimeMillis());

//         // Test connection to Node.js API endpoint
//         try {
//             String apiTestUrl = nodeServerUrl + "/health";
//             ResponseEntity<String> nodeResponse = restTemplate.getForEntity(apiTestUrl, String.class);
//             response.put("nodejsApiConnection", nodeResponse.getStatusCode().toString());
//             response.put("nodejsApiStatus", "connected");

//             // Test file serving endpoint
//             String fileBaseUrl = nodeServerUrl.replace("/api", "");
//             response.put("nodejsFileBaseUrl", fileBaseUrl);

//         } catch (Exception e) {
//             response.put("nodejsApiConnection", "failed");
//             response.put("nodejsApiError", e.getMessage());
//         }

//         return ResponseEntity.ok(response);
//     }
// }















package com.midigenerator.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/midi-files")
@RequiredArgsConstructor
public class MidiProxyController {

    private final RestTemplate restTemplate;

    @Value("${midi.generator.url:http://localhost:5000/api}")
    private String nodeServerUrl;

    /**
     * ✅ Handle CORS preflight requests
     */
    @RequestMapping(value = "/{filename:.+}", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions(@PathVariable String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
        headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS");
        headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "Content-Type, Accept");
        headers.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition, Content-Type, Content-Length");
        headers.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");
        return ResponseEntity.ok().headers(headers).build();
    }

    /**
     * ✅ FIXED: Properly handle MIDI file downloads
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getMidiFile(@PathVariable String filename) {
        log.info("🎵 MIDI Download Request - Filename: {}", filename);
        log.info("🔧 Node Server URL: {}", nodeServerUrl);

        try {
            // Validate filename
            if (filename == null || filename.trim().isEmpty()) {
                log.error("❌ Invalid filename: empty or null");
                return ResponseEntity.badRequest().build();
            }

            // Security: Prevent path traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                log.error("❌ Security: Path traversal attempt blocked: {}", filename);
                return ResponseEntity.badRequest().build();
            }

            // Validate MIDI extension
            if (!filename.toLowerCase().endsWith(".mid") && !filename.toLowerCase().endsWith(".midi")) {
                log.error("❌ Invalid file extension: {}", filename);
                return ResponseEntity.badRequest().build();
            }

            // ✅ FIX: Construct correct URL for file downloads
            String baseUrl = nodeServerUrl;
            if (baseUrl.contains("/api")) {
                baseUrl = baseUrl.replace("/api", "");
            }

            String nodeUrl = baseUrl + "/generated/" + filename;
            log.info("📡 Fetching from Node.js: {}", nodeUrl);

            // ✅ FIX: Set headers to force download
            HttpHeaders requestHeaders = new HttpHeaders();
            requestHeaders.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));
            
            HttpEntity<String> entity = new HttpEntity<>(requestHeaders);

            // Fetch from Node.js
            ResponseEntity<byte[]> response;
            try {
                response = restTemplate.exchange(
                    nodeUrl, 
                    HttpMethod.GET, 
                    entity, 
                    byte[].class
                );
                log.info("✅ Node.js response status: {}", response.getStatusCode());
            } catch (ResourceAccessException e) {
                log.error("❌ Cannot connect to Node.js server at {}", baseUrl);
                log.error("❌ Error details: {}", e.getMessage());
                
                // Return helpful error
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(null);
            } catch (HttpClientErrorException.NotFound e) {
                log.error("❌ File not found on Node.js server: {}", filename);
                log.error("❌ Possible reasons:");
                log.error("   1. Node.js server is not running");
                log.error("   2. File doesn't exist in /generated/ directory");
                log.error("   3. File was cleaned up (older than 4 hours)");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            } catch (HttpClientErrorException e) {
                log.error("❌ Node.js returned error: {} - {}", e.getStatusCode(), e.getMessage());
                return ResponseEntity.status(e.getStatusCode()).build();
            }

            // Check response
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                byte[] midiData = response.getBody();
                log.info("✅ MIDI file fetched successfully: {} bytes", midiData.length);

                // Validate MIDI data
                if (midiData.length < 14) {
                    log.error("❌ MIDI file too small: {} bytes", midiData.length);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }

                // Check if it's a valid MIDI file (starts with "MThd")
                if (midiData.length >= 4) {
                    String header = new String(midiData, 0, 4);
                    if (!"MThd".equals(header)) {
                        log.warn("⚠️ Downloaded file may not be a valid MIDI file. Header: {}", header);
                    }
                }

                ByteArrayResource resource = new ByteArrayResource(midiData);

                // ✅ FIX: Force download with proper headers
                HttpHeaders responseHeaders = new HttpHeaders();
                
                // Use application/octet-stream to force download
                responseHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                responseHeaders.setContentLength(midiData.length);
                
                // Set Content-Disposition to force download
                responseHeaders.set(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + filename + "\""
                );
                
                // CORS headers
                responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
                responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS");
                responseHeaders.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, 
                    "Content-Disposition, Content-Type, Content-Length");
                responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "false");
                
                // Cache control
                responseHeaders.setCacheControl(CacheControl.noCache().mustRevalidate());
                responseHeaders.setPragma("no-cache");

                return ResponseEntity.ok()
                        .headers(responseHeaders)
                        .body(resource);
            } else {
                log.error("❌ Failed to fetch MIDI - Status: {}, Has Body: {}",
                        response.getStatusCode(),
                        response.getBody() != null);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Unexpected error fetching MIDI file: {}", filename);
            log.error("❌ Error type: {}", e.getClass().getName());
            log.error("❌ Error message: {}", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ✅ Health check endpoint for debugging
     */
    @GetMapping("/health-check")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "MIDI Proxy Controller");
        response.put("nodeServerUrl", nodeServerUrl);
        response.put("status", "active");
        response.put("timestamp", System.currentTimeMillis());

        // Test connection to Node.js API endpoint
        try {
            String apiTestUrl = nodeServerUrl + "/health";
            ResponseEntity<String> nodeResponse = restTemplate.getForEntity(apiTestUrl, String.class);
            response.put("nodejsApiConnection", nodeResponse.getStatusCode().toString());
            response.put("nodejsApiStatus", "connected");

            // Test file serving endpoint
            String fileBaseUrl = nodeServerUrl.replace("/api", "");
            response.put("nodejsFileBaseUrl", fileBaseUrl);
            response.put("nodejsFileServingStatus", "configured");

        } catch (Exception e) {
            response.put("nodejsApiConnection", "failed");
            response.put("nodejsApiError", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}