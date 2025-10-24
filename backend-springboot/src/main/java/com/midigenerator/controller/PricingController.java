//midigenerator/controller/PricingController.java
package com.midigenerator.controller;

import com.midigenerator.dto.subscription.PricingPlanResponse;
import com.midigenerator.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @GetMapping("/plans")
    public ResponseEntity<List<PricingPlanResponse>> getAllPlans() {
        return ResponseEntity.ok(pricingService.getAllPlans());
    }
}