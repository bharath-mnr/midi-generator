package com.midigenerator.scheduler;

import com.midigenerator.security.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitCleanupScheduler {

    private final RateLimiter rateLimiter;

    /**
     * Clean up old rate limit entries every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void cleanupRateLimits() {
        try {
            rateLimiter.cleanup();
        } catch (Exception e) {
            log.error("❌ Error cleaning up rate limits: {}", e.getMessage());
        }
    }
}