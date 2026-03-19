package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "premium_calculations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PremiumCalculation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long calculationId;
    
    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private PolicySubscription subscription;
    
    @ManyToOne
    @JoinColumn(name = "usage_id")
    private UsageData usage;
    
    private Double basePremium;
    
    private Double totalAdditions;
    
    private Double totalDiscounts;
    
    private Double finalPremium;
    
    private LocalDateTime calculatedDate = LocalDateTime.now();
}
