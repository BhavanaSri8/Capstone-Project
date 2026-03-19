package org.hartford.miniproject.dto;

import lombok.Data;

@Data
public class PaymentOrderRequest {
    private Long policyId; // This actually refers to the PolicyOrder ID
}
