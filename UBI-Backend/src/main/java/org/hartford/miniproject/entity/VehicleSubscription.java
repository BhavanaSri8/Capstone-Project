package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "vehicle_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleSubscriptionId;
    
    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private PolicySubscription subscription;
    
    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    private LocalDate assignedDate = LocalDate.now();
}
