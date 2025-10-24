//midigenerator/security/RateLimitInterceptor.java
package com.midigenerator.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiter rateLimiter;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // Skip OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String uri = request.getRequestURI();
        String clientIp = getClientIP(request);
        String userId = getUserId();

        // Determine rate limit based on endpoint
        RateLimitRule rule = getRateLimitRule(uri, userId);

        if (rule == null) {
            return true; // No rate limiting for this endpoint
        }

        String key = (userId != null ? "user:" + userId : "ip:" + clientIp) + ":" + rule.type;

        if (rateLimiter.isAllowed(key, rule.maxRequests, rule.windowSeconds)) {
            // Add rate limit headers
            int remaining = rateLimiter.getRemainingRequests(key, rule.maxRequests);
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(remaining));
            response.addHeader("X-Rate-Limit-Limit", String.valueOf(rule.maxRequests));
            return true;
        } else {
            // Rate limit exceeded
            log.warn("⚠️ Rate limit exceeded - Type: {}, Key: {}", rule.type, key);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.addHeader("X-Rate-Limit-Limit", String.valueOf(rule.maxRequests));
            response.addHeader("X-Rate-Limit-Remaining", "0");
            response.addHeader("Retry-After", String.valueOf(rule.windowSeconds));

            String errorJson = String.format(
                    "{\"status\":429,\"message\":\"Rate limit exceeded. Please try again in %d seconds.\",\"type\":\"%s\"}",
                    rule.windowSeconds, rule.type
            );
            response.getWriter().write(errorJson);
            return false;
        }
    }

    private RateLimitRule getRateLimitRule(String uri, String userId) {
        // Authentication endpoints: 5 requests per minute
        if (uri.matches("^/api/auth/(login|signup|refresh)$")) {
            return new RateLimitRule("AUTH", 5, 60);
        }

        // MIDI generation: 10 per minute for authenticated users
        if (uri.startsWith("/api/midi/generate") || uri.startsWith("/api/midi/upload-midi")) {
            return new RateLimitRule("GENERATION", 10, 60);
        }

        // Email operations: 3 per hour
        if (uri.contains("/forgot-password") || uri.contains("/verify-email") || uri.contains("/reset-password")) {
            return new RateLimitRule("EMAIL", 3, 3600);
        }

        // File downloads: 30 per minute
        if (uri.startsWith("/api/midi-files/")) {
            return new RateLimitRule("DOWNLOAD", 30, 60);
        }

        // General API: 20 per minute
        if (uri.startsWith("/api/") && !uri.equals("/api/health") && !uri.equals("/api/pricing/plans")) {
            return new RateLimitRule("GENERAL", 20, 60);
        }

        return null; // No rate limit
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String getUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception e) {
            log.debug("Could not get user ID: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Inner class to define rate limit rules
     */
    private static class RateLimitRule {
        final String type;
        final int maxRequests;
        final int windowSeconds;

        RateLimitRule(String type, int maxRequests, int windowSeconds) {
            this.type = type;
            this.maxRequests = maxRequests;
            this.windowSeconds = windowSeconds;
        }
    }
}
