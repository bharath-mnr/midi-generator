package com.midigenerator.scheduler;

import com.midigenerator.security.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitCleanupScheduler {

    private final RateLimiter rateLimiter;

    /**
     * ✅ FIXED: Clean up old rate limit entries every hour with enhanced logging
     * Runs at: 0 minutes, 0 seconds of every hour
     */
    @Scheduled(cron = "0 0 * * * *")  // ✅ Changed to cron for predictable timing
    public void cleanupRateLimits() {
        try {
            log.info("🧹 Starting scheduled rate limit cleanup...");

            // Get statistics before cleanup
            Map<String, Object> statsBefore = rateLimiter.getStatistics();
            log.info("📊 Pre-cleanup stats: {}", statsBefore);

            // Perform cleanup
            rateLimiter.cleanup();

            // Get statistics after cleanup
            Map<String, Object> statsAfter = rateLimiter.getStatistics();
            log.info("📊 Post-cleanup stats: {}", statsAfter);

            log.info("✅ Scheduled rate limit cleanup completed successfully");

        } catch (Exception e) {
            log.error("❌ Error during scheduled rate limit cleanup: {}", e.getMessage(), e);
            // Don't rethrow - scheduler should continue running
        }
    }

    /**
     * ✅ NEW: Additional cleanup every 15 minutes for aggressive memory management
     * Only cleans entries older than 2 hours, so safe to run frequently
     */
    @Scheduled(fixedRate = 900000)  // 15 minutes
    public void frequentCleanup() {
        try {
            Map<String, Object> stats = rateLimiter.getStatistics();
            int activeEntries = (int) stats.get("activeEntries");

            // Only run if we have significant entries
            if (activeEntries > 100) {
                log.info("🔄 Running frequent cleanup - Active entries: {}", activeEntries);
                rateLimiter.cleanup();
            }
        } catch (Exception e) {
            log.error("❌ Error during frequent cleanup: {}", e.getMessage());
        }
    }

    /**
     * ✅ NEW: Health check - runs every 5 minutes
     * Monitors rate limiter health and warns if issues detected
     */
    @Scheduled(fixedRate = 300000)  // 5 minutes
    public void healthCheck() {
        try {
            Map<String, Object> stats = rateLimiter.getStatistics();
            int activeEntries = (int) stats.get("activeEntries");
            long totalBlocked = (long) stats.get("totalBlockedRequests");
            long minutesSinceCleanup = (long) stats.get("minutesSinceLastCleanup");

            // ✅ Warn if too many entries
            if (activeEntries > 1000) {
                log.warn("⚠️ HEALTH WARNING: {} active rate limit entries (threshold: 1000)", activeEntries);
            }

            // ✅ Warn if cleanup hasn't run recently
            if (minutesSinceCleanup > 70) {  // Should run hourly
                log.warn("⚠️ HEALTH WARNING: Cleanup hasn't run in {} minutes!", minutesSinceCleanup);
            }

            // ✅ Info log for monitoring
            if (activeEntries > 50 || totalBlocked > 100) {
                log.info("📊 Rate Limiter Health: {} entries, {} blocked, last cleanup {} min ago",
                        activeEntries, totalBlocked, minutesSinceCleanup);
            }

        } catch (Exception e) {
            log.error("❌ Error during rate limiter health check: {}", e.getMessage());
        }
    }
}

