package org.hartford.miniproject.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PolicyRequest {
    @NotBlank
    private String policyName;

    private String coverageType;

    private Double basePremium;

    private String description;

    // Extra frontend fields are accepted for compatibility.
    private Integer policyTermYears;
    private Double maturityAmount;
    private Boolean hasPremiumWaiver;
    private Boolean hasPartialWithdrawal;
    private String withdrawalConditions;
}
