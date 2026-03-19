package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hartford.miniproject.dto.StatisticsResponse;
import org.hartford.miniproject.entity.Claim;
import org.hartford.miniproject.entity.Policy;
import org.hartford.miniproject.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final PaymentRepository paymentRepository;
    private final UsageDataRepository usageDataRepository;

    @Transactional(readOnly = true)
    public StatisticsResponse getDashboardStatistics() {
        log.info("Fetching dashboard statistics...");

        long totalCustomers = userRepository.countByRole_RoleName("CUSTOMER");
        long totalVehicles = vehicleRepository.count();
        List<Policy> allPolicies = policyRepository.findAll();
        long totalPolicies = allPolicies.size();
        long activePolicies = allPolicies.stream().filter(Policy::getIsActive).count();
        List<Claim> allClaims = claimRepository.findAll();
        long totalClaims = allClaims.size();

        Double totalRevenueResult = paymentRepository.sumTotalRevenue();
        double totalRevenue = totalRevenueResult != null ? totalRevenueResult : 0.0;

        // Policy Distribution
        Map<String, Long> policyDistribution = allPolicies.stream()
                .collect(Collectors.groupingBy(Policy::getCoverageType, Collectors.counting()));

        // Claims Overview
        Map<String, Long> claimsOverview = allClaims.stream()
                .collect(Collectors.groupingBy(Claim::getClaimStatus, Collectors.counting()));

        // Monthly Revenue
        Map<String, Double> monthlyRevenue = new HashMap<>();
        List<Object[]> revenueData = paymentRepository.sumRevenueByMonth();
        for (Object[] row : revenueData) {
            String monthName = (String) row[0]; // Function MONTHNAME returns string
            Double amount = (Double) row[1];
            
            // Format to Title Case e.g., "JANUARY" -> "Jan"
            if (monthName != null) {
                try {
                    String shortMonth = monthName.substring(0, 3);
                    String formattedMonth = shortMonth.substring(0, 1).toUpperCase() + shortMonth.substring(1).toLowerCase();
                    monthlyRevenue.put(formattedMonth, amount != null ? amount : 0.0);
                } catch (Exception e) {
                   monthlyRevenue.put(monthName, amount != null ? amount : 0.0);
                }
            }
        }

        // Telemetry Behaviors
        Double avgDistanceResult = usageDataRepository.getAverageDistanceTravelled();
        double avgDistance = avgDistanceResult != null ? avgDistanceResult : 0.0;

        Double avgNightDrivingResult = usageDataRepository.getAverageNightDrivingHours();
        double avgNightDriving = avgNightDrivingResult != null ? avgNightDrivingResult : 0.0;

        return StatisticsResponse.builder()
                .totalCustomers(totalCustomers)
                .totalVehicles(totalVehicles)
                .totalPolicies(totalPolicies)
                .activePolicies(activePolicies)
                .totalClaims(totalClaims)
                .totalRevenue(totalRevenue)
                .policyDistribution(policyDistribution)
                .claimsOverview(claimsOverview)
                .monthlyRevenue(monthlyRevenue)
                .avgDistanceTravelled(avgDistance)
                .avgNightDrivingHours(avgNightDriving)
                .build();
    }
}
