package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.entity.Policy;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.hartford.miniproject.repository.PolicyRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicyService {
    
    private final PolicyRepository policyRepository;
    
    public PolicyResponse createPolicy(PolicyRequest request) {
        Policy policy = new Policy();
        policy.setPolicyName(request.getPolicyName());
        policy.setCoverageType(request.getCoverageType());
        policy.setBasePremium(request.getBasePremium() != null ? request.getBasePremium() : 0.0);
        policy.setDescription(request.getDescription());
        policy.setPolicyTermYears(request.getPolicyTermYears());
        policy.setMaturityAmount(request.getMaturityAmount() != null ? request.getMaturityAmount() : 0.0);
        policy.setHasPremiumWaiver(request.getHasPremiumWaiver());
        policy.setHasPartialWithdrawal(request.getHasPartialWithdrawal());
        policy.setWithdrawalConditions(request.getWithdrawalConditions());
        
        policy = policyRepository.save(policy);
        return toResponse(policy);
    }
    
    public Page<PolicyResponse> getAllPolicies(Pageable pageable) {
        return policyRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<PolicyResponse> getFilteredPolicies(Boolean status, String search, Pageable pageable) {
        return policyRepository.findByStatusAndSearch(status, search, pageable).map(this::toResponse);
    }
    
    public PolicyResponse getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        return toResponse(policy);
    }

    public PolicyResponse updatePolicy(Long id, PolicyRequest request) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        policy.setPolicyName(request.getPolicyName());
        policy.setCoverageType(request.getCoverageType());
        policy.setBasePremium(request.getBasePremium() != null ? request.getBasePremium() : policy.getBasePremium());
        policy.setDescription(request.getDescription());
        policy.setPolicyTermYears(request.getPolicyTermYears());
        policy.setMaturityAmount(request.getMaturityAmount() != null ? request.getMaturityAmount() : 0.0);
        policy.setHasPremiumWaiver(request.getHasPremiumWaiver());
        policy.setHasPartialWithdrawal(request.getHasPartialWithdrawal());
        policy.setWithdrawalConditions(request.getWithdrawalConditions());

        policy = policyRepository.save(policy);
        return toResponse(policy);
    }

    public void deletePolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        try {
            policyRepository.delete(policy);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Policy cannot be deleted because it is linked to existing records. Deactivate it instead.");
        }
    }
    
    public PolicyResponse updatePolicyStatus(Long id, Boolean isActive) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        policy.setIsActive(isActive);
        policy = policyRepository.save(policy);
        return toResponse(policy);
    }
    
    private PolicyResponse toResponse(Policy policy) {
        return new PolicyResponse(
                policy.getPolicyId(),
                policy.getPolicyName(),
                policy.getCoverageType(),
                policy.getBasePremium(),
                policy.getDescription(),
                policy.getIsActive(),
                policy.getPolicyTermYears(),
                policy.getMaturityAmount(),
                policy.getHasPremiumWaiver(),
                policy.getHasPartialWithdrawal(),
                policy.getWithdrawalConditions()
        );
    }
}
