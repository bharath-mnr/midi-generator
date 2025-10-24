//midigenerator/security/RateLimiter.java
package com.midigenerator.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
public class RateLimiter {

    // Store: key -> RateLimitInfo
    private final Map<String, RateLimitInfo> limitStore = new ConcurrentHashMap<>();

    /**
     * Check if request is allowed
     * @param key Identifier (IP address or user ID)
     * @param maxRequests Maximum requests allowed
     * @param windowSeconds Time window in seconds
     * @return true if request is allowed, false if rate limited
     */
    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMs = windowSeconds * 1000L;

        RateLimitInfo info = limitStore.computeIfAbsent(key, k -> new RateLimitInfo());

        synchronized (info) {
            // Reset if window expired
            if (now - info.windowStart.get() > windowMs) {
                info.windowStart.set(now);
                info.requestCount.set(0);
            }

            // Check if limit exceeded
            if (info.requestCount.get() >= maxRequests) {
                log.warn("⚠️ Rate limit exceeded for key: {}", key);
                return false;
            }

            // Increment and allow
            info.requestCount.incrementAndGet();
            return true;
        }
    }

    /**
     * Get remaining requests in current window
     */
    public int getRemainingRequests(String key, int maxRequests) {
        RateLimitInfo info = limitStore.get(key);
        if (info == null) {
            return maxRequests;
        }
        return Math.max(0, maxRequests - info.requestCount.get());
    }

    /**
     * Cleanup old entries - call this periodically
     */
    public void cleanup() {
        long now = System.currentTimeMillis();
        limitStore.entrySet().removeIf(entry -> {
            long age = now - entry.getValue().windowStart.get();
            return age > 3600000; // Remove entries older than 1 hour
        });
        log.info("🧹 Rate limiter cleanup - {} entries remaining", limitStore.size());
    }

    /**
     * Inner class to store rate limit info
     */
    private static class RateLimitInfo {
        private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
        private final AtomicInteger requestCount = new AtomicInteger(0);
    }
}