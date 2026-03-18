package org.hartford.miniproject.controller;

import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.service.PolicyOrderService;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/policy-orders")
public class PolicyOrderController {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PolicyOrderController.class);
    private final PolicyOrderService orderService;

    public PolicyOrderController(PolicyOrderService orderService) {
        this.orderService = orderService;
    }
    
    @PostMapping
    public ResponseEntity<PolicyOrder> createOrder(
            @RequestParam Long userId,
            @RequestParam Long policyId,
            @RequestParam(required = false) Long vehicleId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(userId, policyId, vehicleId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PolicyOrder> createOrderWithDocuments(
            @RequestPart("userId") String userId,
            @RequestPart("policyId") String policyId,
            @RequestPart(value = "vehicleId", required = false) String vehicleId,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents) throws IOException {
        
        Long uId = Long.valueOf(userId);
        Long pId = Long.valueOf(policyId);
        Long vId = (vehicleId != null && !vehicleId.isEmpty()) ? Long.valueOf(vehicleId) : null;
        
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrderWithDocuments(uId, pId, vId, documents));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'UNDERWRITER')")
    public ResponseEntity<org.springframework.data.domain.Page<PolicyOrder>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching orders - status: {}, search: {}, page: {}, size: {}", status, search, page, size);
        String statusParam = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) ? status : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        return ResponseEntity.ok(orderService.getFilteredOrders(statusParam, searchParam, org.springframework.data.domain.PageRequest.of(page, size)));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PolicyOrder>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<PolicyOrderResponse> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }
    
    @PutMapping("/{orderId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<PolicySubscription> approveOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.approveOrder(orderId));
    }
    
    @PutMapping("/{orderId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> rejectOrder(@PathVariable Long orderId) {
        orderService.rejectOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{orderId}/documents/{documentName}")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long orderId,
            @PathVariable String documentName,
            @RequestParam(required = false) Boolean inline) throws IOException {
        byte[] fileData = orderService.getDocumentBytes(orderId, documentName);
        
        // Determine content type based on file extension
        String contentType = "application/octet-stream";
        if (documentName.endsWith(".pdf")) contentType = "application/pdf";
        else if (documentName.endsWith(".jpg") || documentName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (documentName.endsWith(".png")) contentType = "image/png";
        
        String disposition = (inline != null && inline) ? "inline" : "attachment";
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + documentName + "\"")
                .body(fileData);
    }
}
