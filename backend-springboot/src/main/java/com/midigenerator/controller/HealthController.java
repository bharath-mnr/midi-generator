////midigenerator/controller/HealthController.java
//package com.midigenerator.controller;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.web.csrf.CsrfToken;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api")
//public class HealthController {
//
//    /**
//     * ✅ Health check endpoint that also triggers CSRF cookie creation
//     * This endpoint is called by frontend on app load to initialize CSRF
//     */
//    @GetMapping("/health")
//    public ResponseEntity<Map<String, Object>> health(CsrfToken csrfToken) {
//        Map<String, Object> response = new HashMap<>();
//        response.put("status", "healthy");
//        response.put("service", "MIDI Generator API");
//        response.put("timestamp", System.currentTimeMillis());
//
//        // ✅ CSRF token is automatically added to cookie by Spring Security
//        // No need to manually add it to response
//
//        return ResponseEntity.ok(response);
//    }
//}









package com.midigenerator.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * ✅ FIXED: Health check that properly triggers CSRF cookie creation
     * Called by frontend on app load to initialize CSRF
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(
            CsrfToken csrfToken,
            HttpServletRequest request
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "MIDI Generator API");
        response.put("timestamp", System.currentTimeMillis());

        // ✅ CRITICAL: Access token to trigger cookie creation
        if (csrfToken != null) {
            response.put("csrf", "initialized");
            // Accessing the token triggers Spring to set the cookie
            String token = csrfToken.getToken();
            System.out.println("🛡️ CSRF token generated: " + token.substring(0, 20) + "...");
        } else {
            response.put("csrf", "unavailable");
            System.out.println("⚠️ CSRF token not available in health check");
        }

        return ResponseEntity.ok(response);
    }
}