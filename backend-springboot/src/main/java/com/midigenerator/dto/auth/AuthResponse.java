package com.midigenerator.dto.auth;

import com.midigenerator.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private User.SubscriptionTier subscriptionTier;
    private Integer remainingGenerations;
    private LocalDateTime subscriptionExpiryDate;
    private Boolean emailVerified; // NEW FIELD
}