package com.midigenerator.dto.generation;

import com.midigenerator.entity.User;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerationLimitResponse {
    private Boolean canGenerate;
    private Integer remainingGenerations;
    private Integer dailyLimit;
    private User.SubscriptionTier currentTier;
    private String message;
    private String upgradeUrl;
}
