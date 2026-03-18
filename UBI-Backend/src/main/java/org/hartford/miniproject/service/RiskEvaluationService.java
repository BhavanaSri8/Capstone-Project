package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.RiskResult;
import org.hartford.miniproject.entity.Policy;
import org.hartford.miniproject.entity.PolicyOrder;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.entity.Vehicle;
import org.hartford.miniproject.repository.ClaimRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RiskEvaluationService {

    private final ClaimRepository claimRepository;

    /**
     * Calculates baseline risk score purely based on driver/vehicle profile.
     * Returns a RiskResult containing the score and level without modifying the entity state.
     */
    public RiskResult evaluateRisk(PolicyOrder order) {
        User user = order.getUser();
        Vehicle vehicle = order.getVehicle();
        Policy policy = order.getPolicy();

        double score = 0;

        // 1. Age Factor (max 30 points)
        if (user.getAge() != null) {
            int age = user.getAge();
            if (age < 25) score += 20;
            else if (age > 75) score += 20;
            else if (age > 60) score += 10;
            // 25-60 is 0 pts
        }

        // 2. Vehicle Type Factor (max 25 points)
        if (vehicle != null && vehicle.getVehicleType() != null) {
            String type = vehicle.getVehicleType().toUpperCase();
            if (type.contains("SPORTS") || type.contains("LUXURY")) score += 25;
            else if (type.contains("SUV")) score += 10;
        }

        // 3. Coverage Type Factor (max 10 points)
        if (policy != null && policy.getCoverageType() != null) {
            if ("COMPREHENSIVE".equalsIgnoreCase(policy.getCoverageType())) {
                score += 10;
            }
        }

        // 4. Claim History Factor (10 points per approved claim)
        long approvedClaims = claimRepository.countBySubscription_Order_User_UserIdAndClaimStatus(
                user.getUserId(), "APPROVED");
        score += (approvedClaims * 10);

        // Apply 15% minimum baseline risk rule
        double finalScore = Math.min(100, Math.max(score, 15.0));
        
        return RiskResult.builder()
                .score(finalScore)
                .level(calculateRiskLevel(finalScore))
                .build();
    }

    private String calculateRiskLevel(double score) {
        if (score >= 70) return "HIGH";
        if (score >= 40) return "MEDIUM";
        return "LOW";
    }
}
