package org.hartford.miniproject.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnderwriterApplicationResponse {
    private Long orderId;
    private String orderStatus;
    private LocalDateTime orderDate;
    private String underwriterRemarks;

    // Customer info
    private Long customerId;
    private String customerName;   // User.fullName
    private String customerEmail;

    // Policy info
    private Long policyId;
    private String policyName;
    private String coverageType;   // Policy.coverageType

    // Vehicle info (if applicable)
    private Long vehicleId;
    private String vehicleType;    // Vehicle.vehicleType
    private String vehicleNumber;  // Vehicle.vehicleNumber

    // Document info
    private String documentNames;
    private String storedDocumentNames;

    // Risk Evaluation
    private Double riskScore;
    private String riskLevel;
    private Integer driverAge;
    private Double nightDrivingHours;
    private Double totalDistanceKm;
}
