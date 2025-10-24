//midigenerator/config/AppConfig.java
package com.midigenerator.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import com.midigenerator.service.VerificationTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ✅ Application configuration with scheduling enabled
 */
@Slf4j
@Configuration
@EnableScheduling  // This enables all @Scheduled methods including daily reset
@RequiredArgsConstructor
public class AppConfig {

    private final VerificationTokenService verificationTokenService;

    /**
     * Clean up expired tokens every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            verificationTokenService.deleteExpiredTokens();
            log.debug("✅ Token cleanup completed");
        } catch (Exception e) {
            log.error("❌ Error cleaning up expired tokens: {}", e.getMessage());
        }
    }
}