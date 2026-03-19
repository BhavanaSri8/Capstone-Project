package org.hartford.miniproject.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {
    private Long policyId;
    private String policyName;
    private String coverageType;
    private Double basePremium;
    private String description;
    private Boolean isActive;
    private Integer policyTermYears;
    private Double maturityAmount;
    private Boolean hasPremiumWaiver;
    private Boolean hasPartialWithdrawal;
    private String withdrawalConditions;
}
