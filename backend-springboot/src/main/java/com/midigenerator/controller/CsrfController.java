package com.midigenerator.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * ✅ Controller to expose CSRF token to frontend
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class CsrfController {

    /**
     * ✅ FIXED: Endpoint to get CSRF token
     * This uses HttpServletRequest to get the token that Spring Security automatically generates
     */
    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> getCsrfToken(HttpServletRequest request) {
        Map<String, String> response = new HashMap<>();

        // Get CSRF token from request attributes (set by Spring Security)
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

        if (csrfToken != null) {
            response.put("token", csrfToken.getToken());
            response.put("headerName", csrfToken.getHeaderName());
            response.put("parameterName", csrfToken.getParameterName());
            log.debug("✅ CSRF token provided to client: {}", csrfToken.getToken().substring(0, 20) + "...");
        } else {
            log.warn("⚠️ CSRF token requested but not available in request attributes");
            // Return empty but successful response - token might be in cookie
            response.put("message", "CSRF token should be available in XSRF-TOKEN cookie");
        }

        return ResponseEntity.ok(response);
    }
}