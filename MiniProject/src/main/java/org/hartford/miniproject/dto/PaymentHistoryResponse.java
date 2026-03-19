package org.hartford.miniproject.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryResponse {
    private String transactionId;
    private Long policyId;
    private String policyName;
    private String customerName;
    private Long userId;
    private Double amount;
    private String status;
    private LocalDateTime date;
}
