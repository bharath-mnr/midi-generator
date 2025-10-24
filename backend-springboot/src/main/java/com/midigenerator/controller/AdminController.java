//midigenerator/controller/AdminController.java
package com.midigenerator.controller;

import com.midigenerator.entity.User;
import com.midigenerator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ✅ Admin endpoints for testing and manual operations
 * IMPORTANT: In production, secure these endpoints with ROLE_ADMIN
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    /**
     * ✅ Manual trigger for daily reset - useful for testing
     * Call this endpoint: POST http://localhost:8080/api/admin/reset-daily-counts
     */
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

    /**
     * ✅ Get current generation stats for all users
     */
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
                // Count by tier
                tierCounts.put(user.getSubscriptionTier().name(),
                        tierCounts.get(user.getSubscriptionTier().name()) + 1);

                // Count generations today
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

    /**
     * ✅ Get detailed info for a specific user
     */
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
}