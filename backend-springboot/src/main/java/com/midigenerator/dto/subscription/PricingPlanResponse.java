package com.midigenerator.dto.subscription;

import com.midigenerator.entity.User;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingPlanResponse {
    private User.SubscriptionTier tier;
    private String name;
    private String description;
    private Double monthlyPrice;
    private Integer dailyLimit;
    private Boolean unlimited;
    private List<String> features;
    private Boolean recommended;
}