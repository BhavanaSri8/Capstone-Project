package org.hartford.miniproject.service;

import org.hartford.miniproject.dto.PolicyRequest;
import org.hartford.miniproject.dto.PolicyResponse;
import org.hartford.miniproject.entity.Policy;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.repository.PolicyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private PolicyService policyService;

    @Test
    void createPolicy_setsDefaultsAndReturnsResponse() {
        PolicyRequest request = new PolicyRequest("Comprehensive", "FULL", 5000.0, "desc", 10, 0.0, true, true, "none");
        when(policyRepository.save(any(Policy.class))).thenAnswer(inv -> {
            Policy policy = inv.getArgument(0);
            policy.setPolicyId(1L);
            return policy;
        });

        PolicyResponse response = policyService.createPolicy(request);

        assertEquals(1L, response.getPolicyId());
        assertEquals("Comprehensive", response.getPolicyName());
    }

    @Test
    void deletePolicy_whenLinkedRecords_throwsBadRequest() {
        Policy policy = new Policy();
        policy.setPolicyId(9L);
        when(policyRepository.findById(9L)).thenReturn(Optional.of(policy));
        doThrow(new DataIntegrityViolationException("fk")).when(policyRepository).delete(policy);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> policyService.deletePolicy(9L));

        assertEquals("Policy cannot be deleted because it is linked to existing records. Deactivate it instead.", ex.getMessage());
    }
}
