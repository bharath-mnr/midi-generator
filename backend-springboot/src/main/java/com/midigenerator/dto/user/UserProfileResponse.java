package com.midigenerator.dto.user;

import com.midigenerator.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private User.SubscriptionTier subscriptionTier;
    private String subscriptionDescription;
    private Integer dailyGenerationCount;
    private Integer remainingGenerations;
    private LocalDateTime lastGenerationDate;
    private LocalDateTime subscriptionExpiryDate;
    private LocalDateTime createdAt;
    private Long totalGenerations;
    private Long totalChats;
    private boolean emailVerified;
}
