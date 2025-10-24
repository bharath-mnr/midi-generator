//midigenerator/service/PricingService.java
package com.midigenerator.service;

import com.midigenerator.dto.subscription.PricingPlanResponse;
import com.midigenerator.entity.User;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PricingService {

    public List<PricingPlanResponse> getAllPlans() {
        return Arrays.stream(User.SubscriptionTier.values())
                .map(tier -> PricingPlanResponse.builder()
                        .tier(tier)
                        .name(getDisplayName(tier))
                        .description(getDescription(tier))
                        .monthlyPrice(getPriceForTier(tier))
                        .dailyLimit(tier.getDailyLimit())
                        .unlimited(tier.hasUnlimitedGenerations())
                        .features(getFeaturesForTier(tier))
                        .recommended(tier == User.SubscriptionTier.PRO)
                        .build())
                .collect(Collectors.toList());
    }

    private String getDisplayName(User.SubscriptionTier tier) {
        switch (tier) {
            case FREE: return "Free";
            case BASIC: return "Basic";
            case PRO: return "Pro";
            case UNLIMITED: return "Unlimited";
            default: return tier.name();
        }
    }

    private String getDescription(User.SubscriptionTier tier) {
        switch (tier) {
            case FREE: return "Get started with AI music generation";
            case BASIC: return "Perfect for regular creators";
            case PRO: return "Best for professional musicians";
            case UNLIMITED: return "Generate without limits";
            default: return "";
        }
    }

    private List<String> getFeaturesForTier(User.SubscriptionTier tier) {
        switch (tier) {
            case FREE:
                return Arrays.asList(
                        "5 MIDI generations per day",
                        "AI music generation",
                        "Export as .mid files",
                        "Web interface access",
                        "VST plugin access"
                );
            case BASIC:
                return Arrays.asList(
                        "20 MIDI generations per day",
                        "AI music generation",
                        "Export as .mid files",
                        "Web interface access",
                        "VST plugin access"
                );
            case PRO:
                return Arrays.asList(
                        "100 MIDI generations per day",
                        "AI music generation",
                        "Export as .mid files",
                        "Web interface access",
                        "VST plugin access"
                );
            case UNLIMITED:
                return Arrays.asList(
                        "Unlimited MIDI generations",
                        "AI music generation",
                        "Export as .mid files",
                        "Web interface access",
                        "VST plugin access"
                );
            default:
                return Collections.emptyList();
        }
    }

    private Double getPriceForTier(User.SubscriptionTier tier) {
        switch (tier) {
            case FREE: return 0.0;
            case BASIC: return 9.99;
            case PRO: return 24.99;
            case UNLIMITED: return 49.99;
            default: return 0.0;
        }
    }
}