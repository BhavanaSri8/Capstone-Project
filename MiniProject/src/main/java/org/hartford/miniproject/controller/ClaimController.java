package org.hartford.miniproject.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.service.ClaimService;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {
    
    private final ClaimService claimService;
    
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClaimResponse> raiseClaim(@Valid @RequestBody ClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.raiseClaim(request));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClaimResponse> raiseClaimWithDocuments(@Valid @ModelAttribute ClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.raiseClaim(request, request.getDocuments()));
    }
    
    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<List<ClaimResponse>> getClaimsBySubscription(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(claimService.getClaimsBySubscription(subscriptionId));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMS_OFFICER')")
    public ResponseEntity<org.springframework.data.domain.Page<ClaimResponse>> getAllClaims(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        String statusParam = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) ? status : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        return ResponseEntity.ok(claimService.getFilteredClaims(statusParam, searchParam, org.springframework.data.domain.PageRequest.of(page, size)));
    }
    
    @PutMapping("/{claimId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMS_OFFICER')")
    public ResponseEntity<ClaimResponse> approveClaim(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.approveClaim(claimId));
    }
    
    @PutMapping("/{claimId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMS_OFFICER')")
    public ResponseEntity<ClaimResponse> rejectClaim(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.rejectClaim(claimId));
    }

    @GetMapping("/{claimId}/documents/{documentName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMS_OFFICER')")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long claimId,
            @PathVariable String documentName) throws IOException {
        byte[] fileData = claimService.getDocumentBytes(claimId, documentName);
        
        // Determine content type based on file extension
        String contentType = "application/octet-stream";
        if (documentName.endsWith(".pdf")) contentType = "application/pdf";
        else if (documentName.endsWith(".jpg") || documentName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (documentName.endsWith(".png")) contentType = "image/png";
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documentName + "\"")
                .body(fileData);
    }
}
