//midigenerator/service/UserService.java
package com.midigenerator.service;

import com.midigenerator.dto.generation.GenerationLimitResponse;
import com.midigenerator.dto.subscription.SubscriptionUpgradeRequest;
import com.midigenerator.dto.user.ChangePasswordRequest;
import com.midigenerator.dto.user.UpdateProfileRequest;
import com.midigenerator.dto.user.UserProfileResponse;
import com.midigenerator.entity.User;
import com.midigenerator.exception.InvalidPasswordException;
import com.midigenerator.exception.UserNotFoundException;
import com.midigenerator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MidiGenerationRepository midiGenerationRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public UserProfileResponse getProfile() {
        User user = getCurrentUser();

        Long totalGenerations = midiGenerationRepository.countByUserIdAndGeneratedAtAfter(
                user.getId(), user.getCreatedAt());
        Long totalChats = chatHistoryRepository.countByUserIdAndCreatedAtAfter(
                user.getId(), user.getCreatedAt());

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .subscriptionTier(user.getSubscriptionTier())
                .subscriptionDescription(user.getSubscriptionTier().getDescription())
                .dailyGenerationCount(user.getDailyGenerationCount())
                .remainingGenerations(user.getRemainingGenerations())
                .lastGenerationDate(user.getLastGenerationDate())
                .subscriptionExpiryDate(user.getSubscriptionExpiryDate())
                .createdAt(user.getCreatedAt())
                .totalGenerations(totalGenerations)
                .totalChats(totalChats)
                .emailVerified(user.getEmailVerified()) // <--- **THIS LINE**
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        userRepository.save(user);
        return getProfile();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public GenerationLimitResponse checkGenerationLimit() {
        User user = getCurrentUser();
        boolean canGenerate = user.canGenerateMore();
        int remaining = user.getRemainingGenerations();

        String message;
        if (!canGenerate) {
            message = String.format("Daily limit reached (%d/%d). Upgrade to generate more.",
                    user.getDailyGenerationCount(), user.getSubscriptionTier().getDailyLimit());
        } else if (remaining <= 1) {
            message = "Last generation for today. Consider upgrading for more.";
        } else {
            message = String.format("%d generations remaining today", remaining);
        }

        return GenerationLimitResponse.builder()
                .canGenerate(canGenerate)
                .remainingGenerations(remaining)
                .dailyLimit(user.getSubscriptionTier().getDailyLimit())
                .currentTier(user.getSubscriptionTier())
                .message(message)
                .upgradeUrl("/pricing")
                .build();
    }

    @Transactional
    public void upgradeSubscription(SubscriptionUpgradeRequest request) {
        User user = getCurrentUser();
        user.setSubscriptionTier(request.getTier());
        user.setSubscriptionExpiryDate(java.time.LocalDateTime.now().plusMonths(1));
        user.setDailyGenerationCount(0);
        userRepository.save(user);
    }
}