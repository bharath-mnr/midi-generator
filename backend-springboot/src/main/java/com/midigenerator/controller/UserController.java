//midigenerator/controller/UserController.java
package com.midigenerator.controller;

import com.midigenerator.dto.generation.GenerationLimitResponse;
import com.midigenerator.dto.subscription.SubscriptionUpgradeRequest;
import com.midigenerator.dto.user.*;
import com.midigenerator.repository.MidiGenerationRepository;
import com.midigenerator.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final MidiGenerationRepository midiGenerationRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/generation-limit")
    public ResponseEntity<GenerationLimitResponse> checkGenerationLimit() {
        return ResponseEntity.ok(userService.checkGenerationLimit());
    }

    @PostMapping("/subscription/upgrade")
    public ResponseEntity<Map<String, String>> upgradeSubscription(@Valid @RequestBody SubscriptionUpgradeRequest request) {
        userService.upgradeSubscription(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Subscription upgraded successfully");
        return ResponseEntity.ok(response);
    }

    // ✅ NEW: Statistics endpoint for dashboard
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        var user = userService.getCurrentUser();

        Long webGenerations = midiGenerationRepository.countByUserIdAndSource(
                user.getId(), "web"
        );

        Long vstGenerations = midiGenerationRepository.countByUserIdAndSource(
                user.getId(), "vst"
        );

        Long totalGenerations = midiGenerationRepository.countByUserId(user.getId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGenerations", totalGenerations);
        stats.put("webGenerations", webGenerations);
        stats.put("vstGenerations", vstGenerations);
        stats.put("dailyGenerationCount", user.getDailyGenerationCount());
        stats.put("remainingGenerations", user.getRemainingGenerations());

        return ResponseEntity.ok(stats);
    }
}
