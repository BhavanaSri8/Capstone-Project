package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long policyId;
    
    @Column(nullable = false)
    private String policyName;
    
    private String coverageType;
    
    @Column(nullable = false)
    private Double basePremium;
    
    private String description;
    
    private Boolean isActive = true;
    
    private Integer policyTermYears;
    
    private Double maturityAmount;
    
    private Boolean hasPremiumWaiver;
    
    private Boolean hasPartialWithdrawal;
    
    private String withdrawalConditions;
}
