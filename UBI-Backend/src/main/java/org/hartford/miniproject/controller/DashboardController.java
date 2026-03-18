package org.hartford.miniproject.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN')")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }
    
    @GetMapping("/risk-distribution")
    public ResponseEntity<Map<String, Long>> getRiskDistribution() {
        return ResponseEntity.ok(dashboardService.getRiskDistribution());
    }
    
    @GetMapping("/monthly-revenue")
    public ResponseEntity<Double> getMonthlyRevenue() {
        return ResponseEntity.ok(dashboardService.getMonthlyRevenue());
    }
    
    @GetMapping("/active-subscriptions")
    public ResponseEntity<Long> getActiveSubscriptionsCount() {
        return ResponseEntity.ok(dashboardService.getActiveSubscriptionsCount());
    }
}
