package org.hartford.miniproject.controller;

import jakarta.validation.Valid;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.service.PolicyService;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PolicyController.class);
    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyResponse> createPolicy(@Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.createPolicy(request));
    }
    
    @GetMapping
    public ResponseEntity<Page<PolicyResponse>> getAllPolicies(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching policies - status: {}, search: {}, page: {}, size: {}", status, search, page, size);
        
        Boolean statusParam = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) {
            statusParam = Boolean.valueOf(status);
        }
        
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return ResponseEntity.ok(policyService.getFilteredPolicies(statusParam, searchParam, PageRequest.of(page, size)));
    }
    
    @GetMapping("/{policyId}")
    public ResponseEntity<PolicyResponse> getPolicyById(@PathVariable Long policyId) {
        return ResponseEntity.ok(policyService.getPolicyById(policyId));
    }

    @PutMapping("/{policyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyResponse> updatePolicy(
            @PathVariable Long policyId,
            @Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.ok(policyService.updatePolicy(policyId, request));
    }

    @DeleteMapping("/{policyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long policyId) {
        policyService.deletePolicy(policyId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{policyId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyResponse> updatePolicyStatus(
            @PathVariable Long policyId,
            @RequestParam Boolean isActive) {
        return ResponseEntity.ok(policyService.updatePolicyStatus(policyId, isActive));
    }
}
