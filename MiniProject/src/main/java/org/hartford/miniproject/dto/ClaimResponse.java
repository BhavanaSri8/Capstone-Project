package org.hartford.miniproject.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {
    private Long claimId;
    private Long subscriptionId;
    private Double claimAmount;
    private String claimReason;
    private String claimStatus;
    private LocalDateTime submittedDate;
    private String reviewedBy;
    private String customerName;
    private String policyName;
    private String orderStatus;
    private List<String> documentNames;
}
