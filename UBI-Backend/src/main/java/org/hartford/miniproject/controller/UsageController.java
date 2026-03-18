package org.hartford.miniproject.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.service.UsageService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {
    
    private final UsageService usageService;
    
    @PostMapping
    public ResponseEntity<UsageResponse> addUsage(@Valid @RequestBody UsageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usageService.addUsage(request));
    }
    
    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<List<UsageResponse>> getUsageBySubscription(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(usageService.getUsageBySubscription(subscriptionId));
    }
    
    @GetMapping("/subscription/{subscriptionId}/month")
    public ResponseEntity<UsageResponse> getUsageByMonth(
            @PathVariable Long subscriptionId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(usageService.getUsageByMonth(subscriptionId, month, year));
    }
}
