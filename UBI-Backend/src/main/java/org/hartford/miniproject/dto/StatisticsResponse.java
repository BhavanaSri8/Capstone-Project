package org.hartford.miniproject.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class StatisticsResponse {
    private long totalCustomers;
    private long totalVehicles;
    private long totalPolicies;
    private long activePolicies;
    private long totalClaims;
    private double totalRevenue;

    private Map<String, Long> policyDistribution;
    private Map<String, Long> claimsOverview;
    private Map<String, Double> monthlyRevenue;

    private double avgDistanceTravelled;
    private double avgNightDrivingHours;
}
