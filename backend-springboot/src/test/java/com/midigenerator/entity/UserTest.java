package com.midigenerator.entity;

import org.junit.jupiter.api.*;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ KEEP THIS - Tests User entity business logic
 * Critical methods: canGenerateMore(), incrementGenerationCount(), getRemainingGenerations()
 */
class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("test@example.com");
        user.setFullName("Test User");
        user.setSubscriptionTier(User.SubscriptionTier.FREE);
        user.setEmailVerified(true);
        user.setDailyGenerationCount(0);
        user.setLastGenerationDate(LocalDateTime.now());
    }

    @Test
    @DisplayName("New user can generate")
    void newUserCanGenerate() {
        assertTrue(user.canGenerateMore());
        assertEquals(5, user.getRemainingGenerations()); // FREE tier
    }

    @Test
    @DisplayName("User at limit cannot generate")
    void userAtLimitCannotGenerate() {
        user.setDailyGenerationCount(5); // FREE tier limit
        assertFalse(user.canGenerateMore());
        assertEquals(0, user.getRemainingGenerations());
    }

    @Test
    @DisplayName("Unlimited tier always can generate")
    void unlimitedTierAlwaysCanGenerate() {
        user.setSubscriptionTier(User.SubscriptionTier.UNLIMITED);
        user.setDailyGenerationCount(999);

        assertTrue(user.canGenerateMore());
        assertEquals(-1, user.getRemainingGenerations());
    }

    @Test
    @DisplayName("Daily count resets on new day")
    void dailyCountResetsOnNewDay() {
        user.setDailyGenerationCount(5);
        user.setLastGenerationDate(LocalDateTime.now().minusDays(1)); // Yesterday

        // Check should trigger reset
        assertTrue(user.canGenerateMore());
        assertEquals(5, user.getRemainingGenerations()); // Back to full
    }

    @Test
    @DisplayName("Increment generation count updates values")
    void incrementGenerationCountUpdates() {
        LocalDateTime before = LocalDateTime.now().minusMinutes(1);

        user.incrementGenerationCount();

        assertEquals(1, user.getDailyGenerationCount());
        assertNotNull(user.getLastGenerationDate());
        assertTrue(user.getLastGenerationDate().isAfter(before));
    }

    @Test
    @DisplayName("Different tiers have different limits")
    void differentTiersHaveDifferentLimits() {
        user.setSubscriptionTier(User.SubscriptionTier.FREE);
        assertEquals(5, user.getRemainingGenerations());

        user.setSubscriptionTier(User.SubscriptionTier.BASIC);
        user.setDailyGenerationCount(0);
        assertEquals(20, user.getRemainingGenerations());

        user.setSubscriptionTier(User.SubscriptionTier.PRO);
        user.setDailyGenerationCount(0);
        assertEquals(100, user.getRemainingGenerations());

        user.setSubscriptionTier(User.SubscriptionTier.UNLIMITED);
        user.setDailyGenerationCount(0);
        assertEquals(-1, user.getRemainingGenerations());
    }
}
