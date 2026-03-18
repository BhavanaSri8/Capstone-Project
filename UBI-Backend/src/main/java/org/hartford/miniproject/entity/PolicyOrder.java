package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;
    
    private LocalDateTime orderDate = LocalDateTime.now();
    
    private String orderStatus = "PENDING";

    @Column(length = 4000)
    private String documentNames;

    @Column(length = 4000)
    private String storedDocumentNames;

    /** Vehicle selected by the customer when submitting the application. */
    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    /** Remarks or document-request notes added by the Underwriter. */
    @Column(length = 2000)
    private String underwriterRemarks;

    private Double riskScore;

    private String riskLevel; // LOW, MEDIUM, HIGH
}
