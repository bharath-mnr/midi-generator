package com.midigenerator.service;

import com.midigenerator.security.RateLimiter;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ KEEP THIS - Tests custom rate limiting logic
 * This is YOUR business logic, not framework code
 */
class RateLimiterTest {

    private RateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new RateLimiter();
    }

    @Test
    @DisplayName("Allows requests within limit")
    void allowsRequestsWithinLimit() {
        String key = "user:test@example.com";
        int maxRequests = 5;
        int windowSeconds = 60;

        // All 5 requests should be allowed
        for (int i = 0; i < maxRequests; i++) {
            assertTrue(rateLimiter.isAllowed(key, maxRequests, windowSeconds),
                    "Request " + (i + 1) + " should be allowed");
        }
    }

    @Test
    @DisplayName("Blocks requests when limit exceeded")
    void blocksRequestsWhenLimitExceeded() {
        String key = "user:test@example.com";
        int maxRequests = 3;
        int windowSeconds = 60;

        // Use up limit
        for (int i = 0; i < maxRequests; i++) {
            assertTrue(rateLimiter.isAllowed(key, maxRequests, windowSeconds));
        }

        // 4th request should be blocked
        assertFalse(rateLimiter.isAllowed(key, maxRequests, windowSeconds));
    }

    @Test
    @DisplayName("Different users have independent limits")
    void differentUsersHaveIndependentLimits() {
        String key1 = "user:user1@example.com";
        String key2 = "user:user2@example.com";
        int maxRequests = 2;
        int windowSeconds = 60;

        // Use up key1's limit
        assertTrue(rateLimiter.isAllowed(key1, maxRequests, windowSeconds));
        assertTrue(rateLimiter.isAllowed(key1, maxRequests, windowSeconds));
        assertFalse(rateLimiter.isAllowed(key1, maxRequests, windowSeconds));

        // key2 should still work
        assertTrue(rateLimiter.isAllowed(key2, maxRequests, windowSeconds));
    }

    @Test
    @DisplayName("Correctly calculates remaining requests")
    void correctlyCalculatesRemainingRequests() {
        String key = "user:test@example.com";
        int maxRequests = 5;
        int windowSeconds = 60;

        assertEquals(5, rateLimiter.getRemainingRequests(key, maxRequests));

        rateLimiter.isAllowed(key, maxRequests, windowSeconds);
        assertEquals(4, rateLimiter.getRemainingRequests(key, maxRequests));

        rateLimiter.isAllowed(key, maxRequests, windowSeconds);
        assertEquals(3, rateLimiter.getRemainingRequests(key, maxRequests));
    }

    @Test
    @DisplayName("Window resets after time passes")
    void windowResetsAfterTimePasses() throws InterruptedException {
        String key = "user:test@example.com";
        int maxRequests = 2;
        int windowSeconds = 1; // 1 second window

        // Use up limit
        assertTrue(rateLimiter.isAllowed(key, maxRequests, windowSeconds));
        assertTrue(rateLimiter.isAllowed(key, maxRequests, windowSeconds));
        assertFalse(rateLimiter.isAllowed(key, maxRequests, windowSeconds));

        // Wait for window to expire
        Thread.sleep(1100);

        // Should work again
        assertTrue(rateLimiter.isAllowed(key, maxRequests, windowSeconds));
    }
}

