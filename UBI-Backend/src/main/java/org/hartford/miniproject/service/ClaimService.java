package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.*;
import org.hartford.miniproject.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    
    private final ClaimRepository claimRepository;
    private final PolicySubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${claims.upload-dir:./data/claim-documents}")
    private String uploadDir;
    
    public ClaimResponse raiseClaim(ClaimRequest request) {
        PolicySubscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        if (!"PAID".equals(subscription.getOrder().getOrderStatus())) {
            throw new BadRequestException("Claim cannot be raised for subscription #" + subscription.getSubscriptionId() + ". Premium payment is pending for this policy.");
        }
        
        Claim claim = new Claim();
        claim.setSubscription(subscription);
        claim.setClaimAmount(request.getClaimAmount());
        claim.setClaimReason(request.getClaimReason());
        
        claim = claimRepository.save(claim);
        
        // Notify Claims Officers
        notificationService.notifyRole(
            "CLAIMS_OFFICER",
            "New Claim Submission",
            "A new claim has been submitted for subscription #" + subscription.getSubscriptionId(),
            "NEW_CLAIM"
        );
        
        return toResponse(claim);
    }

        @Transactional
        public ClaimResponse raiseClaim(ClaimRequest request, List<MultipartFile> documents) {
                PolicySubscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        if (!"PAID".equals(subscription.getOrder().getOrderStatus())) {
            throw new BadRequestException("Claim cannot be raised for subscription #" + subscription.getSubscriptionId() + ". Premium payment is pending for this policy.");
        }

                Claim claim = new Claim();
                claim.setSubscription(subscription);
                claim.setClaimAmount(request.getClaimAmount());
                claim.setClaimReason(request.getClaimReason());

                claim = claimRepository.save(claim);

                if (documents != null && !documents.isEmpty()) {
                        validateDocuments(documents);
                        storeDocuments(claim, documents);
                        claim = claimRepository.save(claim);
                }

                // Notify Claims Officers
                notificationService.notifyRole(
                    "CLAIMS_OFFICER",
                    "New Claim Submission",
                    "A new claim with documents has been submitted for subscription #" + subscription.getSubscriptionId(),
                    "NEW_CLAIM"
                );

                return toResponse(claim);
        }
    
    public List<ClaimResponse> getClaimsBySubscription(Long subscriptionId) {
        return claimRepository.findBySubscription_SubscriptionId(subscriptionId)
                .stream().map(this::toResponse).toList();
    }
    
    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream().map(this::toResponse).toList();
    }

    public org.springframework.data.domain.Page<ClaimResponse> getFilteredClaims(String status, String search, org.springframework.data.domain.Pageable pageable) {
        return claimRepository.findByStatusAndSearch(status, search, pageable).map(this::toResponse);
    }
    
    @Transactional
    public ClaimResponse approveClaim(Long claimId) {
        Long reviewerId = getAuthenticatedUserId();
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        
        // Atomic update - only succeeds if claim is still PENDING
        int rowsUpdated = claimRepository.updateClaimStatus(claimId, "APPROVED", reviewer);
        
        if (rowsUpdated == 0) {
            // Either claim doesn't exist or it's already processed
            Claim claim = claimRepository.findById(claimId)
                    .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
            throw new ClaimAlreadyProcessedException(
                    "Claim #" + claimId + " was already processed with status: " + claim.getClaimStatus());
        }
        
        // Fetch updated claim
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        // Notify Customer
        notificationService.createNotification(
            claim.getSubscription().getOrder().getUser().getUserId(),
            "Claim Approved",
            "Your claim #" + claimId + " has been approved.",
            "CLAIM_APPROVAL"
        );
        emailService.sendClaimApprovedEmail(
            claim.getSubscription().getOrder().getUser().getEmail(),
            claim.getSubscription().getOrder().getUser().getFullName(),
            claim.getClaimId(),
            claim.getClaimAmount());

        return toResponse(claim);
    }
    
    @Transactional
    public ClaimResponse rejectClaim(Long claimId) {
        Long reviewerId = getAuthenticatedUserId();
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        
        // Atomic update - only succeeds if claim is still PENDING
        int rowsUpdated = claimRepository.updateClaimStatus(claimId, "REJECTED", reviewer);
        
        if (rowsUpdated == 0) {
            // Either claim doesn't exist or it's already processed
            Claim claim = claimRepository.findById(claimId)
                    .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
            throw new ClaimAlreadyProcessedException(
                    "Claim #" + claimId + " was already processed with status: " + claim.getClaimStatus());
        }
        
        // Fetch updated claim
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        // Notify Customer
        notificationService.createNotification(
            claim.getSubscription().getOrder().getUser().getUserId(),
            "Claim Rejected",
            "Your claim #" + claimId + " has been rejected.",
            "CLAIM_REJECTION"
        );
        emailService.sendClaimRejectedEmail(
            claim.getSubscription().getOrder().getUser().getEmail(),
            claim.getSubscription().getOrder().getUser().getFullName(),
            claim.getClaimId());

        return toResponse(claim);
    }
    
    private ClaimResponse toResponse(Claim claim) {
        return new ClaimResponse(
                claim.getClaimId(),
                claim.getSubscription().getSubscriptionId(),
                claim.getClaimAmount(),
                claim.getClaimReason(),
                claim.getClaimStatus(),
                claim.getSubmittedDate(),
                                claim.getReviewedBy() != null ? claim.getReviewedBy().getFullName() : null,
                                splitCsv(claim.getDocumentNames())
        );
    }

        private void validateDocuments(List<MultipartFile> documents) {
                for (MultipartFile file : documents) {
                        if (file == null || file.isEmpty()) {
                                throw new BadRequestException("Uploaded file cannot be empty");
                        }

                        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
                        int dotIndex = originalName.lastIndexOf('.');
                        String extension = dotIndex >= 0 ? originalName.substring(dotIndex + 1).toLowerCase() : "";

                        if (!ALLOWED_EXTENSIONS.contains(extension)) {
                                throw new BadRequestException("Unsupported file format for " + originalName + ". Allowed formats: PDF, JPG, JPEG, PNG");
                        }

                        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
                                throw new BadRequestException("File " + originalName + " exceeds 5 MB limit");
                        }
                }
        }

        private void storeDocuments(Claim claim, List<MultipartFile> documents) {
                Path claimFolder = Paths.get(uploadDir, String.valueOf(claim.getClaimId()));
                List<String> originalNames = new java.util.ArrayList<>();
                List<String> storedNames = new java.util.ArrayList<>();

                try {
                        Files.createDirectories(claimFolder);
                        for (MultipartFile file : documents) {
                                String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename());
                                String storedName = UUID.randomUUID() + "_" + originalName.replace(" ", "_");
                                Path target = claimFolder.resolve(storedName);
                                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                                originalNames.add(originalName);
                                storedNames.add(storedName);
                        }
                } catch (IOException ex) {
                        throw new BadRequestException("Failed to store supporting documents");
                }

                claim.setDocumentNames(String.join(",", originalNames));
                claim.setStoredDocumentNames(String.join(",", storedNames));
        }

        private List<String> splitCsv(String value) {
                if (value == null || value.isBlank()) {
                        return List.of();
                }
                return Arrays.stream(value.split(","))
                                .map(String::trim)
                                .filter(v -> !v.isEmpty())
                                .toList();
        }

        public byte[] getDocumentBytes(Long claimId, String documentName) throws IOException {
                Claim claim = claimRepository.findById(claimId)
                                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

                // UI sends original name; storage uses UUID-prefixed name. Resolve reliably.
                String storedFileName = resolveStoredDocumentName(claim, documentName);
                Path filePath = Paths.get(uploadDir, String.valueOf(claimId), storedFileName).normalize();

                Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
                Path resolvedFile = filePath.toAbsolutePath().normalize();

                if (!resolvedFile.startsWith(uploadPath)) {
                        throw new BadRequestException("Invalid file path");
                }

                if (!Files.exists(resolvedFile)) {
                        throw new ResourceNotFoundException("Document file not found on disk");
                }

                return Files.readAllBytes(resolvedFile);
        }

        private String resolveStoredDocumentName(Claim claim, String requestedName) {
                List<String> originals = splitCsv(claim.getDocumentNames());
                List<String> stored = splitCsv(claim.getStoredDocumentNames());

                // If a stored name is sent directly, allow it.
                if (stored.contains(requestedName)) {
                        return requestedName;
                }

                int idx = originals.indexOf(requestedName);
                if (idx >= 0 && idx < stored.size()) {
                        return stored.get(idx);
                }

                throw new BadRequestException("Document not found for this claim");
        }

        private Long getAuthenticatedUserId() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new BadRequestException("User not authenticated");
                }
                // authentication.getName() returns the email set by JwtAuthenticationFilter
                String email = authentication.getName();
                return userRepository.findByEmail(email)
                        .orElseThrow(() -> new BadRequestException("Authenticated user not found"))
                        .getUserId();
        }
}
