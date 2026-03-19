package org.hartford.miniproject.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageRequest {
    @NotNull
    private Long subscriptionId;
    
    @NotNull
    @Min(1) @Max(12)
    private Integer billingMonth;
    
    @NotNull
    private Integer billingYear;
    
    @PositiveOrZero
    private Double totalDistanceKm;
    
    @PositiveOrZero
    private Double nightDrivingHours;
    
    @PositiveOrZero
    private Integer tripCount;
    
    private String riskCategory;
}
