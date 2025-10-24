package com.midigenerator.dto.subscription;

import com.midigenerator.entity.User;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionUpgradeRequest {
    @NotNull(message = "Subscription tier is required")
    private User.SubscriptionTier tier;

    private String paymentMethodId; // For future payment integration (Stripe, PayPal, etc.)
}