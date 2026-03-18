package org.hartford.miniproject.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.entity.PremiumCalculation;
import org.hartford.miniproject.service.PremiumService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/premium")
@RequiredArgsConstructor
public class PremiumController {
    
    private final PremiumService premiumService;
    
    @PostMapping("/calculate/{subscriptionId}")
    public ResponseEntity<PremiumCalculation> calculatePremium(
            @PathVariable Long subscriptionId,
            @RequestParam Long usageId) {
        return ResponseEntity.ok(premiumService.calculatePremium(subscriptionId, usageId));
    }
    
    @GetMapping("/history/{subscriptionId}")
    public ResponseEntity<List<PremiumCalculation>> getPremiumHistory(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(premiumService.getPremiumHistory(subscriptionId));
    }
}
