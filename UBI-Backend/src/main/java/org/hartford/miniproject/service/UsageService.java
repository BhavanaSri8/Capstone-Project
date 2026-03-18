package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.*;
import org.hartford.miniproject.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UsageService {
    
    private final UsageDataRepository usageRepository;
    private final PolicySubscriptionRepository subscriptionRepository;
    
    public UsageResponse addUsage(UsageRequest request) {
        PolicySubscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        Optional<UsageData> existing = usageRepository.findBySubscription_SubscriptionIdAndBillingMonthAndBillingYear(
                request.getSubscriptionId(), request.getBillingMonth(), request.getBillingYear());
        
        if (existing.isPresent()) {
            throw new BadRequestException("Usage data already exists for this period");
        }
        
        UsageData usage = new UsageData();
        usage.setSubscription(subscription);
        usage.setBillingMonth(request.getBillingMonth());
        usage.setBillingYear(request.getBillingYear());
        usage.setTotalDistanceKm(request.getTotalDistanceKm());
        usage.setNightDrivingHours(request.getNightDrivingHours());
        usage.setTripCount(request.getTripCount());
        usage.setRiskCategory(request.getRiskCategory());
        
        usage = usageRepository.save(usage);
        return toResponse(usage);
    }
    
    public List<UsageResponse> getUsageBySubscription(Long subscriptionId) {
        return usageRepository.findBySubscription_SubscriptionId(subscriptionId)
                .stream().map(this::toResponse).toList();
    }
    
    public UsageResponse getUsageByMonth(Long subscriptionId, Integer month, Integer year) {
        UsageData usage = usageRepository.findBySubscription_SubscriptionIdAndBillingMonthAndBillingYear(
                subscriptionId, month, year)
                .orElseThrow(() -> new ResourceNotFoundException("Usage data not found"));
        return toResponse(usage);
    }
    
    private UsageResponse toResponse(UsageData usage) {
        return new UsageResponse(
                usage.getUsageId(),
                usage.getSubscription().getSubscriptionId(),
                usage.getBillingMonth(),
                usage.getBillingYear(),
                usage.getTotalDistanceKm(),
                usage.getNightDrivingHours(),
                usage.getTripCount(),
                usage.getRiskCategory()
        );
    }
}
