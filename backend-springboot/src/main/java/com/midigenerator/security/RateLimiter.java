
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

    // ✅ FIX 1: Track statistics for monitoring
    private final AtomicLong totalRequestsBlocked = new AtomicLong(0);
    private final AtomicLong totalCleanupRuns = new AtomicLong(0);
    private final AtomicLong lastCleanupTime = new AtomicLong(System.currentTimeMillis());

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
                info.lastAccessTime.set(now);  // ✅ FIX 2: Track last access
            }

            // Check if limit exceeded
            if (info.requestCount.get() >= maxRequests) {
                totalRequestsBlocked.incrementAndGet();  // ✅ FIX 3: Track blocked requests
                log.warn("⚠️ Rate limit exceeded for key: {} (blocked: {})",
                        maskSensitiveKey(key), totalRequestsBlocked.get());
                return false;
            }

            // Increment and allow
            info.requestCount.incrementAndGet();
            info.lastAccessTime.set(now);  // ✅ FIX 2: Update access time
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
     * ✅ FIXED: Enhanced cleanup with better logging and metrics
     */
    public void cleanup() {
        long startTime = System.currentTimeMillis();
        int beforeSize = limitStore.size();

        log.info("🧹 Starting rate limiter cleanup - Current entries: {}", beforeSize);

        // ✅ FIX 4: Clean up entries that haven't been accessed in 2 hours
        // This is safer than 1 hour since some rate limits (like email) use 1 hour windows
        long cleanupThreshold = 2 * 3600000; // 2 hours in milliseconds
        long now = System.currentTimeMillis();

        int removedCount = 0;
        int expiredCount = 0;

        for (Map.Entry<String, RateLimitInfo> entry : limitStore.entrySet()) {
            RateLimitInfo info = entry.getValue();
            long timeSinceLastAccess = now - info.lastAccessTime.get();

            // Remove if not accessed in 2 hours
            if (timeSinceLastAccess > cleanupThreshold) {
                limitStore.remove(entry.getKey());
                removedCount++;
                log.debug("🗑️ Removed stale entry: {} (inactive for {} minutes)",
                        maskSensitiveKey(entry.getKey()),
                        timeSinceLastAccess / 60000);
            }
        }

        int afterSize = limitStore.size();
        long duration = System.currentTimeMillis() - startTime;

        totalCleanupRuns.incrementAndGet();
        lastCleanupTime.set(System.currentTimeMillis());

        // ✅ FIX 5: Comprehensive logging
        log.info("✅ Rate limiter cleanup completed:");
        log.info("   - Entries before: {}", beforeSize);
        log.info("   - Entries removed: {}", removedCount);
        log.info("   - Entries remaining: {}", afterSize);
        log.info("   - Duration: {}ms", duration);
        log.info("   - Total blocked requests: {}", totalRequestsBlocked.get());
        log.info("   - Total cleanup runs: {}", totalCleanupRuns.get());

        // ✅ FIX 6: Warning if map is growing too large
        if (afterSize > 1000) {
            log.warn("⚠️ WARNING: Rate limiter has {} entries - possible memory leak!", afterSize);
        }
    }

    /**
     * ✅ NEW: Get statistics for monitoring
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("activeEntries", limitStore.size());
        stats.put("totalBlockedRequests", totalRequestsBlocked.get());
        stats.put("totalCleanupRuns", totalCleanupRuns.get());
        stats.put("lastCleanupTime", lastCleanupTime.get());
        stats.put("minutesSinceLastCleanup",
                (System.currentTimeMillis() - lastCleanupTime.get()) / 60000);
        return stats;
    }

    /**
     * ✅ NEW: Manual reset for testing or emergency situations
     */
    public void reset() {
        int sizeBefore = limitStore.size();
        limitStore.clear();
        log.warn("🔄 Rate limiter manually reset - cleared {} entries", sizeBefore);
    }

    /**
     * ✅ NEW: Reset specific key (useful for testing or unlocking users)
     */
    public void resetKey(String key) {
        if (limitStore.remove(key) != null) {
            log.info("🔓 Reset rate limit for key: {}", maskSensitiveKey(key));
        }
    }

    /**
     * ✅ FIX 7: Mask sensitive information in logs
     */
    private String maskSensitiveKey(String key) {
        if (key == null || key.length() < 4) {
            return "***";
        }

        // For email addresses
        if (key.contains("@")) {
            String[] parts = key.split("@");
            if (parts.length == 2) {
                String localPart = parts[0];
                String domain = parts[1];

                String maskedLocal = localPart.substring(0, Math.min(2, localPart.length())) + "***";
                return maskedLocal + "@" + domain;
            }
        }

        // For IP addresses or other keys
        return key.substring(0, Math.min(4, key.length())) + "***";
    }

    /**
     * Inner class to store rate limit info
     */
    private static class RateLimitInfo {
        private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
        private final AtomicInteger requestCount = new AtomicInteger(0);
        private final AtomicLong lastAccessTime = new AtomicLong(System.currentTimeMillis());  // ✅ NEW
    }
}
