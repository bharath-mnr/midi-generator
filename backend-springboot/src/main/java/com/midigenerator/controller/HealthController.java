//midigenerator/controller/HealthController.java
package com.midigenerator.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * ✅ Health check endpoint that also triggers CSRF cookie creation
     * This endpoint is called by frontend on app load to initialize CSRF
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(CsrfToken csrfToken) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "MIDI Generator API");
        response.put("timestamp", System.currentTimeMillis());

        // ✅ CSRF token is automatically added to cookie by Spring Security
        // No need to manually add it to response

        return ResponseEntity.ok(response);
    }
}
