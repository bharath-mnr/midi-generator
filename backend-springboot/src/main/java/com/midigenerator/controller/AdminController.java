package com.midigenerator.controller;

import com.midigenerator.entity.User;
import com.midigenerator.repository.UserRepository;
import com.midigenerator.security.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final RateLimiter rateLimiter;  // ✅ NEW: Inject rate limiter

    @PostMapping("/reset-daily-counts")
    public ResponseEntity<Map<String, Object>> resetDailyGenerationCounts() {
        try {
            log.info("🔄 Manual daily generation count reset triggered");

            LocalDateTime today = LocalDateTime.now();
            LocalDate todayDate = today.toLocalDate();

            List<User> users = userRepository.findAll();

            int resetCount = 0;
            int totalUsers = users.size();

            for (User user : users) {
                if (user.getLastGenerationDate() != null) {
                    LocalDate lastGenDate = user.getLastGenerationDate().toLocalDate();

                    if (!lastGenDate.isEqual(todayDate)) {
                        int oldCount = user.getDailyGenerationCount();
                        user.setDailyGenerationCount(0);
                        resetCount++;

                        log.info("Reset user {}: {} -> 0", user.getEmail(), oldCount);
                    }
                }
            }

            if (resetCount > 0) {
                userRepository.saveAll(users);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalUsers", totalUsers);
            response.put("usersReset", resetCount);
            response.put("message", String.format("Reset daily counts for %d out of %d users", resetCount, totalUsers));
            response.put("timestamp", LocalDateTime.now());

            log.info("✅ Manual reset complete: {} users affected", resetCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error in manual daily reset: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/generation-stats")
    public ResponseEntity<Map<String, Object>> getGenerationStats() {
        try {
            List<User> users = userRepository.findAll();

            int totalUsers = users.size();
            int usersWithGenerations = 0;
            int totalGenerationsToday = 0;

            Map<String, Integer> tierCounts = new HashMap<>();
            tierCounts.put("FREE", 0);
            tierCounts.put("BASIC", 0);
            tierCounts.put("PRO", 0);
            tierCounts.put("UNLIMITED", 0);

            LocalDate today = LocalDate.now();

            for (User user : users) {
                tierCounts.put(user.getSubscriptionTier().name(),
                        tierCounts.get(user.getSubscriptionTier().name()) + 1);

                if (user.getLastGenerationDate() != null) {
                    LocalDate lastGenDate = user.getLastGenerationDate().toLocalDate();
                    if (lastGenDate.isEqual(today)) {
                        usersWithGenerations++;
                        totalGenerationsToday += user.getDailyGenerationCount();
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalUsers", totalUsers);
            response.put("usersGeneratedToday", usersWithGenerations);
            response.put("totalGenerationsToday", totalGenerationsToday);
            response.put("usersByTier", tierCounts);
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error fetching generation stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<Map<String, Object>> getUserInfo(@PathVariable String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("emailVerified", user.getEmailVerified());
            response.put("subscriptionTier", user.getSubscriptionTier());
            response.put("dailyGenerationCount", user.getDailyGenerationCount());
            response.put("remainingGenerations", user.getRemainingGenerations());
            response.put("lastGenerationDate", user.getLastGenerationDate());
            response.put("createdAt", user.getCreatedAt());
            response.put("canGenerateMore", user.canGenerateMore());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * ✅ NEW: Get rate limiter statistics
     */
    @GetMapping("/rate-limiter/stats")
    public ResponseEntity<Map<String, Object>> getRateLimiterStats() {
        try {
            Map<String, Object> stats = rateLimiter.getStatistics();
            stats.put("timestamp", LocalDateTime.now());

            log.info("📊 Rate limiter stats requested: {}", stats);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("❌ Error fetching rate limiter stats: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * ✅ NEW: Manually trigger rate limiter cleanup
     */
    @PostMapping("/rate-limiter/cleanup")
    public ResponseEntity<Map<String, Object>> triggerRateLimiterCleanup() {
        try {
            log.info("🧹 Manual rate limiter cleanup triggered");

            Map<String, Object> statsBefore = rateLimiter.getStatistics();
            rateLimiter.cleanup();
            Map<String, Object> statsAfter = rateLimiter.getStatistics();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statsBefore", statsBefore);
            response.put("statsAfter", statsAfter);
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error during manual cleanup: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * ✅ NEW: Reset rate limit for specific user (emergency unlock)
     */
    @PostMapping("/rate-limiter/reset/{email}")
    public ResponseEntity<Map<String, String>> resetRateLimit(@PathVariable String email) {
        try {
            log.info("🔓 Resetting rate limit for email: {}", email);

            // Reset both email and user-based rate limits
            rateLimiter.resetKey("email:" + email.toLowerCase());
            rateLimiter.resetKey("user:" + email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Rate limit reset for: " + email);
            response.put("timestamp", LocalDateTime.now().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}