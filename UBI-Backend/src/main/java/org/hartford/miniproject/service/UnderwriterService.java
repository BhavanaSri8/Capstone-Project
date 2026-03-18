package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.*;
import org.hartford.miniproject.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnderwriterService {

    private final PolicyOrderRepository orderRepository;
    private final PolicySubscriptionRepository subscriptionRepository;
    private final VehicleSubscriptionRepository vehicleSubscriptionRepository;
    private final RiskEvaluationService riskEvaluationService;
    private final UsageDataRepository usageRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // ------------------------------------
    // Dashboard
    // ------------------------------------

    public UnderwriterDashboardResponse getDashboard() {
        long pending  = orderRepository.countByOrderStatus("PENDING");
        long approved = orderRepository.countByOrderStatus("APPROVED");
        long rejected = orderRepository.countByOrderStatus("REJECTED");
        long highRisk = orderRepository.countByOrderStatusAndRiskLevel("PENDING", "HIGH");
        
        return UnderwriterDashboardResponse.builder()
                .pendingApplications(pending)
                .approvedApplications(approved)
                .rejectedApplications(rejected)
                .totalApplications(pending + approved + rejected)
                .highRiskApplications(highRisk)
                .build();
    }

    // ------------------------------------
    // Applications
    // ------------------------------------

    @Transactional(readOnly = true)
    public List<UnderwriterApplicationResponse> getAllApplications() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UnderwriterApplicationResponse> getFilteredApplications(String status, String search, org.springframework.data.domain.Pageable pageable) {
        return orderRepository.findByStatusAndSearch(status, search, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = false)
    public List<UnderwriterApplicationResponse> getPendingApplications() {
        return orderRepository.findByOrderStatus("PENDING")
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ------------------------------------
    // Decision endpoints
    // ------------------------------------

    @Transactional
    public UnderwriterApplicationResponse approvePolicy(Long orderId, UnderwriterDecisionRequest request) {
        PolicyOrder order = getOrderOrThrow(orderId);
        if (!order.getOrderStatus().equals("PENDING")) {
            throw new BadRequestException("Order " + orderId + " is not in PENDING state");
        }

        order.setOrderStatus("APPROVED");
        order.setUnderwriterRemarks(request != null ? request.getRemarks() : null);
        
        // Final risk calculation and lock for audit trail
        RiskResult risk = riskEvaluationService.evaluateRisk(order);
        order.setRiskScore(risk.getScore());
        order.setRiskLevel(risk.getLevel());
        orderRepository.save(order);
        // Notify Customer
        notificationService.createNotification(
            order.getUser().getUserId(),
            "Policy Approved",
            "Your application for " + order.getPolicy().getPolicyName() + " has been approved.",
            "POLICY_APPROVAL"
        );
        emailService.sendPolicyApprovedEmail(
            order.getUser().getEmail(),
            order.getUser().getFullName(),
            order.getPolicy().getPolicyName(),
            order.getOrderId());

        // Create a subscription
        PolicySubscription subscription = new PolicySubscription();
        subscription.setOrder(order);
        subscription.setPolicy(order.getPolicy());
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusYears(1));
        PolicySubscription saved = subscriptionRepository.save(subscription);

        // Link vehicle if present
        if (order.getVehicle() != null) {
            VehicleSubscription vs = new VehicleSubscription();
            vs.setSubscription(saved);
            vs.setVehicle(order.getVehicle());
            vehicleSubscriptionRepository.save(vs);
        }

        return toResponse(order);
    }

    @Transactional
    public UnderwriterApplicationResponse rejectPolicy(Long orderId, UnderwriterDecisionRequest request) {
        PolicyOrder order = getOrderOrThrow(orderId);
        if (!order.getOrderStatus().equals("PENDING")) {
            throw new BadRequestException("Order " + orderId + " is not in PENDING state");
        }

        order.setOrderStatus("REJECTED");
        order.setUnderwriterRemarks(request != null ? request.getRemarks() : null);
        
        // Final risk calculation and lock for audit trail
        RiskResult risk = riskEvaluationService.evaluateRisk(order);
        order.setRiskScore(risk.getScore());
        order.setRiskLevel(risk.getLevel());
        orderRepository.save(order);
        // Notify Customer
        notificationService.createNotification(
            order.getUser().getUserId(),
            "Policy Rejected",
            "Your application for " + order.getPolicy().getPolicyName() + " has been rejected.",
            "POLICY_REJECTION"
        );
        emailService.sendPolicyRejectedEmail(
            order.getUser().getEmail(),
            order.getUser().getFullName(),
            order.getPolicy().getPolicyName(),
            order.getUnderwriterRemarks());
        return toResponse(order);
    }

    @Transactional
    public UnderwriterApplicationResponse requestDocuments(Long orderId, UnderwriterDecisionRequest request) {
        PolicyOrder order = getOrderOrThrow(orderId);

        String note = request != null ? request.getRemarks() : "Please submit additional documents.";
        order.setUnderwriterRemarks(note);
        order.setOrderStatus("DOCUMENTS_REQUESTED");
        orderRepository.save(order);

        // Notify Customer
        notificationService.createNotification(
            order.getUser().getUserId(),
            "Documents Requested",
            "Additional documents are required for your policy application.",
            "DOCUMENT_REQUEST"
        );
        emailService.sendDocumentsRequestedEmail(
            order.getUser().getEmail(),
            order.getUser().getFullName(),
            order.getUnderwriterRemarks());
        return toResponse(order);
    }

    // ------------------------------------
    // Helpers
    // ------------------------------------

    private PolicyOrder getOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("PolicyOrder not found with id " + orderId));
    }

    private UnderwriterApplicationResponse toResponse(PolicyOrder order) {
        Policy policy = order.getPolicy();
        User user = order.getUser();
        Vehicle vehicle = order.getVehicle();

        Double displayRiskScore = order.getRiskScore();
        String displayRiskLevel = order.getRiskLevel();

        // Calculate dynamically if it's not finalized OR if historical risk data is missing (for old records)
        boolean isFinalized = "APPROVED".equals(order.getOrderStatus()) || "REJECTED".equals(order.getOrderStatus());
        if (!isFinalized || displayRiskScore == null || displayRiskScore == 0) {
            RiskResult dynamicRisk = riskEvaluationService.evaluateRisk(order);
            displayRiskScore = dynamicRisk.getScore();
            displayRiskLevel = dynamicRisk.getLevel();
        }
        UsageData usage = usageRepository.findAllBySubscription_Order_OrderId(order.getOrderId())
                .stream()
                .max(Comparator.comparing(UsageData::getUsageId))
                .orElse(null);

        return UnderwriterApplicationResponse.builder()
                .orderId(order.getOrderId())
                .orderStatus(order.getOrderStatus())
                .orderDate(order.getOrderDate())
                .underwriterRemarks(order.getUnderwriterRemarks())
                .documentNames(order.getDocumentNames())
                .storedDocumentNames(order.getStoredDocumentNames())
                // customer
                .customerId(user.getUserId())
                .customerName(user.getFullName())
                .customerEmail(user.getEmail())
                .driverAge(user.getAge())
                // policy
                .policyId(policy.getPolicyId())
                .policyName(policy.getPolicyName())
                .coverageType(policy.getCoverageType())
                // vehicle (nullable)
                .vehicleId(vehicle != null ? vehicle.getVehicleId() : null)
                .vehicleType(vehicle != null ? vehicle.getVehicleType() : null)
                .vehicleNumber(vehicle != null ? vehicle.getVehicleNumber() : null)
                // Risk details (Dynamic if pending, else persisted)
                .riskScore(displayRiskScore)
                .riskLevel(displayRiskLevel)
                .nightDrivingHours(usage != null ? usage.getNightDrivingHours() : null)
                .totalDistanceKm(usage != null ? usage.getTotalDistanceKm() : null)
                .build();
    }
}
