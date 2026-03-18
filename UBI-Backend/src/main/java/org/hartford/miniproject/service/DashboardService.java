package org.hartford.miniproject.service;

import lombok.*;
import org.hartford.miniproject.repository.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final PolicyOrderRepository policyOrderRepository;
    private final PolicySubscriptionRepository subscriptionRepository;
    private final UsageDataRepository usageRepository;
    private final ClaimRepository claimRepository;
    private final PremiumCalculationRepository calculationRepository;
    
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", userRepository.count());
        summary.put("totalPolicies", policyRepository.findByIsActive(true).size());
        summary.put("totalSubscriptions", subscriptionRepository.count());
        summary.put("totalClaims", claimRepository.count());
        summary.put("pendingOrders", policyOrderRepository.countByOrderStatus("PENDING"));
        summary.put("activeSubscriptions", subscriptionRepository.findBySubscriptionStatus("ACTIVE").size());
        summary.put("monthlyRevenue", getMonthlyRevenue());
        return summary;
    }
    
    public Map<String, Long> getRiskDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("low", usageRepository.countByRiskCategory("LOW"));
        distribution.put("medium", usageRepository.countByRiskCategory("MEDIUM"));
        distribution.put("high", usageRepository.countByRiskCategory("HIGH"));
        return distribution;
    }
    
    public Double getMonthlyRevenue() {
        // Calculate revenue for current month
        java.time.YearMonth currentMonth = java.time.YearMonth.now();
        
        return calculationRepository.findAll().stream()
                .filter(calc -> {
                    if (calc.getCalculatedDate() != null) {
                        java.time.YearMonth calcMonth = java.time.YearMonth.from(calc.getCalculatedDate());
                        return calcMonth.equals(currentMonth);
                    }
                    return false;
                })
                .mapToDouble(calc -> calc.getFinalPremium() != null ? calc.getFinalPremium() : 0.0)
                .sum();
    }
    
    public Long getActiveSubscriptionsCount() {
        return (long) subscriptionRepository.findBySubscriptionStatus("ACTIVE").size();
    }
}
