package org.hartford.miniproject.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hartford.miniproject.dto.PaymentHistoryResponse;
import org.hartford.miniproject.dto.PaymentOrderResponse;

import org.hartford.miniproject.entity.Payment;
import org.hartford.miniproject.entity.PaymentStatus;
import org.hartford.miniproject.entity.PolicyOrder;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.hartford.miniproject.repository.PaymentRepository;
import org.hartford.miniproject.repository.PolicyOrderRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PolicyOrderRepository orderRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final PdfInvoiceService pdfInvoiceService;

    public PaymentService(
            PaymentRepository paymentRepository,
            PolicyOrderRepository orderRepository,
            EmailService emailService,
            NotificationService notificationService,
            PdfInvoiceService pdfInvoiceService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.pdfInvoiceService = pdfInvoiceService;
    }


    @Transactional
    public PaymentOrderResponse simulatePayment(Long userId, Long orderId) {
        log.info("Simulating payment for policy order: {} by user: {}", orderId, userId);

        PolicyOrder policyOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy Order not found"));

        if (!policyOrder.getUser().getUserId().equals(userId)) {
            throw new BadRequestException("Not authorized to pay for this policy");
        }

        // Prevent Duplicate Payments
        boolean alreadyPaid = paymentRepository.existsByPolicyIdAndPaymentStatus(orderId, PaymentStatus.SUCCESS);
        if (alreadyPaid) {
            log.warn("Payment already successful for policy order: {}", orderId);
            throw new BadRequestException("Premium for this policy is already paid.");
        }

        double amount = policyOrder.getPolicy().getBasePremium();

        try {
            // 1. Simulate generating a Transaction ID
            String transactionId = "TXN-" + System.currentTimeMillis();

            // 2. Save Payment as SUCCESS immediately
            Payment payment = new Payment();
            payment.setPolicyId(orderId);
            payment.setUserId(userId);
            payment.setAmount(amount);
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(transactionId);
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);

            // 3. Mark the Policy Order as PAID
            policyOrder.setOrderStatus("PAID");
            orderRepository.save(policyOrder);

            log.info("Simulated payment successful for order {}. Generated TXN ID: {}", orderId, transactionId);

            User user = policyOrder.getUser();

            // 3. Send in-app notification
            notificationService.createNotification(
                user.getUserId(),
                "Payment Successful",
                "Your payment for " + policyOrder.getPolicy().getPolicyName() + " has been completed successfully.",
                "PAYMENT_SUCCESS"
            );

            // 4. Generate PDF
            File invoicePdf = null;
            try {
                invoicePdf = pdfInvoiceService.generateInvoice(payment, policyOrder, user);
            } catch (Exception e) {
                log.error("Could not generate invoice for simulated payment", e);
            }

            // 5. Send email confirmation
            emailService.sendPaymentConfirmationEmail(
                user.getEmail(),
                user.getFullName(),
                policyOrder.getPolicy().getPolicyName(),
                transactionId,
                amount,
                invoicePdf
            );

            return PaymentOrderResponse.builder()
                    .orderId(transactionId)
                    .amount(amount)
                    .currency("INR")
                    .key("SIMULATED")
                    .build();

        } catch (Exception e) {
            log.error("Unexpected error during simulated payment for policy order {}: {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Internal error during payment initiation: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> getPaymentHistory(Long userId) {
        log.info("Fetching payment history for user: {}", userId);
        return paymentRepository.findByUserId(userId).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<PaymentHistoryResponse> getFilteredPayments(PaymentStatus status, String search, org.springframework.data.domain.Pageable pageable) {
        return paymentRepository.findByStatusAndSearch(status, search, pageable)
                .map(this::mapToHistoryResponse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<PaymentHistoryResponse> getFilteredPaymentsForUser(Long userId, PaymentStatus status, String search, org.springframework.data.domain.Pageable pageable) {
        return paymentRepository.findByUserIdAndStatusAndSearch(userId, status, search, pageable)
                .map(this::mapToHistoryResponse);
    }

    private PaymentHistoryResponse mapToHistoryResponse(Payment p) {
        String policyName = "Policy #" + p.getPolicyId();
        String customerName = "Member #" + p.getUserId();

        try {
            PolicyOrder order = orderRepository.findById(p.getPolicyId()).orElse(null);
            if (order != null) {
                if (order.getPolicy() != null && order.getPolicy().getPolicyName() != null) {
                    policyName = order.getPolicy().getPolicyName();
                }
                if (order.getUser() != null && order.getUser().getFullName() != null) {
                    customerName = order.getUser().getFullName();
                }
            }
        } catch (Exception e) {
            log.error("Error mapping payment history for payment ID {}: {}", p.getId(), e.getMessage());
        }

        return new PaymentHistoryResponse(
                p.getTransactionId(),
                p.getPolicyId(),
                policyName,
                customerName,
                p.getUserId(),
                p.getAmount(),
                p.getPaymentStatus().name(),
                p.getPaymentDate() != null ? p.getPaymentDate() : p.getCreatedAt()
        );
    }
}
