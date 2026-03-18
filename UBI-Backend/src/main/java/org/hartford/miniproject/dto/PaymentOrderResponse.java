package org.hartford.miniproject.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentOrderResponse {
    private String orderId;       // Razorpay Order ID
    private Double amount;        // Amount in currency
    private String currency;      // Currency code, e.g., INR
    private String key;           // Razorpay Key ID for frontend
}
