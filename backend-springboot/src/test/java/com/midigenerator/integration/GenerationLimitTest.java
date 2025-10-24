package com.midigenerator.integration;

import com.midigenerator.BaseIntegrationTest;
import com.midigenerator.entity.User;
import com.midigenerator.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ KEEP THIS - Tests critical business logic
 * Covers: Daily limits, generation counting, tier restrictions
 */
class GenerationLimitTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setupUser() {
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setSubscriptionTier(User.SubscriptionTier.FREE);
        testUser.setEmailVerified(true);
        testUser.setDailyGenerationCount(0);
        testUser.setLastGenerationDate(LocalDateTime.now());
        testUser = userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("FREE tier user can generate within 5/day limit")
    void freeUserCanGenerateWithinLimit() {
        // FREE tier = 5 generations per day
        assertTrue(testUser.canGenerateMore());
        assertEquals(5, testUser.getRemainingGenerations());

        // Simulate 3 generations
        for (int i = 0; i < 3; i++) {
            testUser.incrementGenerationCount();
        }
        testUser = userRepository.save(testUser);

        // Should still be able to generate
        assertTrue(testUser.canGenerateMore());
        assertEquals(2, testUser.getRemainingGenerations());
        assertEquals(3, testUser.getDailyGenerationCount());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("FREE tier user cannot exceed 5/day limit")
    void freeUserCannotExceedLimit() {
        // Use up all 5 generations
        for (int i = 0; i < 5; i++) {
            testUser.incrementGenerationCount();
        }
        testUser = userRepository.save(testUser);

        // Should NOT be able to generate more
        assertFalse(testUser.canGenerateMore());
        assertEquals(0, testUser.getRemainingGenerations());
        assertEquals(5, testUser.getDailyGenerationCount());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("Daily count resets on new day")
    void dailyCountResetsOnNewDay() {
        // Use some generations today
        testUser.setDailyGenerationCount(3);
        testUser.setLastGenerationDate(LocalDateTime.now().minusDays(1)); // Yesterday
        testUser = userRepository.save(testUser);

        // Check if can generate (should reset)
        boolean canGenerate = testUser.canGenerateMore();
        int remaining = testUser.getRemainingGenerations();

        assertTrue(canGenerate);
        assertEquals(5, remaining); // Should be reset to full limit
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("UNLIMITED tier has infinite generations")
    void unlimitedTierHasNoLimit() {
        testUser.setSubscriptionTier(User.SubscriptionTier.UNLIMITED);
        testUser.setDailyGenerationCount(999);
        testUser = userRepository.save(testUser);

        assertTrue(testUser.canGenerateMore());
        assertEquals(-1, testUser.getRemainingGenerations()); // -1 = unlimited
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("PRO tier has 100 generations/day")
    void proTierHasHigherLimit() {
        testUser.setSubscriptionTier(User.SubscriptionTier.PRO);
        testUser.setDailyGenerationCount(50);
        testUser = userRepository.save(testUser);

        assertTrue(testUser.canGenerateMore());
        assertEquals(50, testUser.getRemainingGenerations()); // 100 - 50 = 50
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("Increment generation count works correctly")
    void incrementGenerationCountWorks() {
        assertEquals(0, testUser.getDailyGenerationCount());

        testUser.incrementGenerationCount();
        assertEquals(1, testUser.getDailyGenerationCount());

        testUser.incrementGenerationCount();
        assertEquals(2, testUser.getDailyGenerationCount());

        assertNotNull(testUser.getLastGenerationDate());
    }
}
