package org.hartford.miniproject.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageResponse {
    private Long usageId;
    private Long subscriptionId;
    private Integer billingMonth;
    private Integer billingYear;
    private Double totalDistanceKm;
    private Double nightDrivingHours;
    private Integer tripCount;
    private String riskCategory;
}
