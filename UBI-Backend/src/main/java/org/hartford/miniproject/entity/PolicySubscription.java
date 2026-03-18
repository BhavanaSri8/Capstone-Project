package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "policy_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicySubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subscriptionId;
    
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private PolicyOrder order;
    
    @ManyToOne
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String billingCycle = "MONTHLY";
    
    private String subscriptionStatus = "ACTIVE";
}
