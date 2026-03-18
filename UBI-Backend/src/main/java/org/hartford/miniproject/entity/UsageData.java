package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usage_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usageId;
    
    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private PolicySubscription subscription;
    
    @Column(nullable = false)
    private Integer billingMonth;
    
    @Column(nullable = false)
    private Integer billingYear;
    
    private Double totalDistanceKm;
    
    private Double nightDrivingHours;
    
    private Integer tripCount;
    
    private String riskCategory;
}
