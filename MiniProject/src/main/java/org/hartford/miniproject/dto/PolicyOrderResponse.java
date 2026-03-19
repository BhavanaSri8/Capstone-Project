package org.hartford.miniproject.dto;

import java.time.LocalDateTime;

public class PolicyOrderResponse {
    private Long orderId;
    private Long userId;
    private String customerName;
    private Long policyId;
    private String policyName;
    private String coverageType;
    private String description;
    private Double basePremium;
    private java.time.LocalDateTime orderDate;
    private String orderStatus;

    public PolicyOrderResponse() {}

    public PolicyOrderResponse(Long orderId, Long userId, String customerName, Long policyId, String policyName, String coverageType, String description, Double basePremium, java.time.LocalDateTime orderDate, String orderStatus) {
        this.orderId = orderId;
        this.userId = userId;
        this.customerName = customerName;
        this.policyId = policyId;
        this.policyName = policyName;
        this.coverageType = coverageType;
        this.description = description;
        this.basePremium = basePremium;
        this.orderDate = orderDate;
        this.orderStatus = orderStatus;
    }

    // Getters and Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Long getPolicyId() { return policyId; }
    public void setPolicyId(Long policyId) { this.policyId = policyId; }
    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }
    public String getCoverageType() { return coverageType; }
    public void setCoverageType(String coverageType) { this.coverageType = coverageType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getBasePremium() { return basePremium; }
    public void setBasePremium(Double basePremium) { this.basePremium = basePremium; }
    public java.time.LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(java.time.LocalDateTime orderDate) { this.orderDate = orderDate; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
}
