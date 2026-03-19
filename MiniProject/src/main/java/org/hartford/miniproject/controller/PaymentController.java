package org.hartford.miniproject.controller;

import lombok.extern.slf4j.Slf4j;
import org.hartford.miniproject.dto.PaymentHistoryResponse;
import org.hartford.miniproject.dto.PaymentOrderRequest;
import org.hartford.miniproject.dto.PaymentOrderResponse;

import org.hartford.miniproject.security.JwtUtil;
import org.hartford.miniproject.service.PaymentService;
import org.hartford.miniproject.repository.UserRepository;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @org.springframework.beans.factory.annotation.Value("${payment.invoice.dir:./data/invoices}")
    private String invoiceDir;

    @PostMapping("/simulate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentOrderResponse> simulatePayment(
            @RequestBody PaymentOrderRequest request,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        log.info("Received request to simulate payment for policy ID {} by user ID {}", request.getPolicyId(), userId);
        return ResponseEntity.ok(paymentService.simulatePayment(userId, request.getPolicyId()));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<org.springframework.data.domain.Page<PaymentHistoryResponse>> getPaymentHistory(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        log.info("Received request to get payment history for user ID {}", userId);

        org.hartford.miniproject.entity.PaymentStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) {
            try {
                statusEnum = org.hartford.miniproject.entity.PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }
        
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return ResponseEntity.ok(paymentService.getFilteredPaymentsForUser(userId, statusEnum, searchParam, org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<PaymentHistoryResponse>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        org.hartford.miniproject.entity.PaymentStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) {
            try {
                statusEnum = org.hartford.miniproject.entity.PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }
        
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        return ResponseEntity.ok(paymentService.getFilteredPayments(statusEnum, searchParam, org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @GetMapping("/{transactionId}/invoice")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<byte[]> getInvoice(
            @PathVariable String transactionId,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        log.info("User {} requesting invoice for transaction {}", userId, transactionId);
        
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get(invoiceDir, "Invoice_" + transactionId + ".pdf");
            if (!java.nio.file.Files.exists(filePath)) {
                log.warn("Invoice not found for transaction: {}", transactionId);
                return ResponseEntity.notFound().build();
            }
            byte[] pdfBytes = java.nio.file.Files.readAllBytes(filePath);
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Invoice_" + transactionId + ".pdf\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (java.io.IOException e) {
            log.error("Error reading invoice file for transaction {}", transactionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private Long getUserIdFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new ResourceNotFoundException("Invalid token");
        }
        String jwt = token.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getUserId();
    }
}
