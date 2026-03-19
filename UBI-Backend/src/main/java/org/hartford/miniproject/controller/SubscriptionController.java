package org.hartford.miniproject.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.service.PolicySubscriptionService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    
    private final PolicySubscriptionService subscriptionService;
    
    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<PolicySubscription>> getAllSubscriptions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        String statusParam = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) ? status : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        return ResponseEntity.ok(subscriptionService.getFilteredSubscriptions(statusParam, searchParam, org.springframework.data.domain.PageRequest.of(page, size)));
    }
    
    @GetMapping("/{subscriptionId}")
    public ResponseEntity<PolicySubscription> getSubscriptionById(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionById(subscriptionId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<org.springframework.data.domain.Page<PolicySubscription>> getSubscriptionsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        String statusParam = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) ? status : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        return ResponseEntity.ok(subscriptionService.getFilteredSubscriptionsForUser(userId, statusParam, searchParam, org.springframework.data.domain.PageRequest.of(page, size)));
    }
    
    @PutMapping("/{subscriptionId}/status")
    public ResponseEntity<PolicySubscription> updateStatus(
            @PathVariable Long subscriptionId,
            @RequestParam String status) {
        return ResponseEntity.ok(subscriptionService.updateStatus(subscriptionId, status));
    }

    @PostMapping("/{subscriptionId}/renew")
    public ResponseEntity<PolicySubscription> renewSubscription(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(subscriptionService.renewSubscription(subscriptionId));
    }
}

@RestController
@RequestMapping("/api/vehicle-subscriptions")
@RequiredArgsConstructor
class VehicleSubscriptionController {
    
    private final PolicySubscriptionService subscriptionService;
    
    @PostMapping
    public ResponseEntity<VehicleSubscription> attachVehicle(
            @RequestParam Long subscriptionId,
            @RequestParam Long vehicleId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.attachVehicle(subscriptionId, vehicleId));
    }
    
    @GetMapping("/{subscriptionId}")
    public ResponseEntity<List<VehicleSubscription>> getVehiclesBySubscription(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(subscriptionService.getVehiclesBySubscription(subscriptionId));
    }
}
