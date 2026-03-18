package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimId;
    
    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private PolicySubscription subscription;
    
    private Double claimAmount;
    
    private String claimReason;
    
    private String claimStatus = "PENDING";
    
    private LocalDateTime submittedDate = LocalDateTime.now();

    @Column(length = 4000)
    private String documentNames;

    @Column(length = 4000)
    private String storedDocumentNames;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;
}
