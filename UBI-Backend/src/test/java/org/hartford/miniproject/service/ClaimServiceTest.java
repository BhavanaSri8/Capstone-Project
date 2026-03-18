package org.hartford.miniproject.service;

import org.hartford.miniproject.dto.ClaimRequest;
import org.hartford.miniproject.dto.ClaimResponse;
import org.hartford.miniproject.entity.Claim;
import org.hartford.miniproject.entity.Policy;
import org.hartford.miniproject.entity.PolicySubscription;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.repository.ClaimRepository;
import org.hartford.miniproject.repository.PolicySubscriptionRepository;
import org.hartford.miniproject.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private PolicySubscriptionRepository subscriptionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ClaimService claimService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void raiseClaim_createsPendingClaim() {
        ClaimRequest request = new ClaimRequest(10L, 500.0, "damage");
        PolicySubscription subscription = buildSubscription(10L);

        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(subscription));
        when(claimRepository.save(any(Claim.class))).thenAnswer(inv -> {
            Claim claim = inv.getArgument(0);
            claim.setClaimId(1L);
            return claim;
        });

        ClaimResponse response = claimService.raiseClaim(request);

        assertEquals(1L, response.getClaimId());
        assertEquals("PENDING", response.getClaimStatus());
    }

    @Test
    void approveClaim_updatesStatusAtomically() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("reviewer@mail.com", "pwd", List.of())
        );

        User authUser = new User();
        authUser.setUserId(3L);
        authUser.setEmail("reviewer@mail.com");

        User reviewer = new User();
        reviewer.setUserId(3L);
        reviewer.setFullName("Reviewer");

        Claim claim = new Claim();
        claim.setClaimId(7L);
        claim.setSubscription(buildSubscription(10L));
        claim.setClaimAmount(200.0);
        claim.setClaimReason("repair");
        claim.setClaimStatus("APPROVED");
        claim.setReviewedBy(reviewer);

        when(userRepository.findByEmail("reviewer@mail.com")).thenReturn(Optional.of(authUser));
        when(userRepository.findById(3L)).thenReturn(Optional.of(reviewer));
        when(claimRepository.updateClaimStatus(7L, "APPROVED", reviewer)).thenReturn(1);
        when(claimRepository.findById(7L)).thenReturn(Optional.of(claim));

        ClaimResponse response = claimService.approveClaim(7L);

        assertEquals("APPROVED", response.getClaimStatus());
        assertEquals("Reviewer", response.getReviewedBy());
    }

    @Test
    void getDocumentBytes_resolvesOriginalNameToStoredName() throws Exception {
        Path uploadRoot = Files.createTempDirectory("claim-doc-test");
        ReflectionTestUtils.setField(claimService, "uploadDir", uploadRoot.toString());

        Claim claim = new Claim();
        claim.setClaimId(9L);
        claim.setDocumentNames("proof.pdf");
        claim.setStoredDocumentNames("uuid_proof.pdf");

        Path claimFolder = uploadRoot.resolve("9");
        Files.createDirectories(claimFolder);
        byte[] expected = "file-data".getBytes();
        Files.write(claimFolder.resolve("uuid_proof.pdf"), expected);

        when(claimRepository.findById(9L)).thenReturn(Optional.of(claim));

        byte[] actual = claimService.getDocumentBytes(9L, "proof.pdf");

        assertArrayEquals(expected, actual);
    }

    private PolicySubscription buildSubscription(Long id) {
        Policy policy = new Policy();
        policy.setPolicyId(1L);
        policy.setPolicyName("Policy");
        policy.setBasePremium(3000.0);

        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(id);
        subscription.setPolicy(policy);
        return subscription;
    }
}
