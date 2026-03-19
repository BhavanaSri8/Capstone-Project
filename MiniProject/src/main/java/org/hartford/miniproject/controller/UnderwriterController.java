package org.hartford.miniproject.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.service.UnderwriterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/underwriter")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'UNDERWRITER')")
public class UnderwriterController {

    private final UnderwriterService underwriterService;

    // GET /api/underwriter/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<UnderwriterDashboardResponse> getDashboard() {
        return ResponseEntity.ok(underwriterService.getDashboard());
    }

    // GET /api/underwriter/applications — all applications
    @GetMapping("/applications")
    public ResponseEntity<org.springframework.data.domain.Page<UnderwriterApplicationResponse>> getAllApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        String statusParam = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) ? status : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        return ResponseEntity.ok(underwriterService.getFilteredApplications(statusParam, searchParam, org.springframework.data.domain.PageRequest.of(page, size)));
    }

    // GET /api/underwriter/applications/pending — only pending
    @GetMapping("/applications/pending")
    public ResponseEntity<List<UnderwriterApplicationResponse>> getPendingApplications() {
        return ResponseEntity.ok(underwriterService.getPendingApplications());
    }

    // POST /api/underwriter/approve-policy/{orderId}
    @PostMapping("/approve-policy/{orderId}")
    public ResponseEntity<UnderwriterApplicationResponse> approvePolicy(
            @PathVariable Long orderId,
            @RequestBody(required = false) UnderwriterDecisionRequest request) {
        return ResponseEntity.ok(underwriterService.approvePolicy(orderId, request));
    }

    // POST /api/underwriter/reject-policy/{orderId}
    @PostMapping("/reject-policy/{orderId}")
    public ResponseEntity<UnderwriterApplicationResponse> rejectPolicy(
            @PathVariable Long orderId,
            @RequestBody(required = false) UnderwriterDecisionRequest request) {
        return ResponseEntity.ok(underwriterService.rejectPolicy(orderId, request));
    }

    // POST /api/underwriter/request-documents/{orderId}
    @PostMapping("/request-documents/{orderId}")
    public ResponseEntity<UnderwriterApplicationResponse> requestDocuments(
            @PathVariable Long orderId,
            @RequestBody(required = false) UnderwriterDecisionRequest request) {
        return ResponseEntity.ok(underwriterService.requestDocuments(orderId, request));
    }
}
