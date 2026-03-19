package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.hartford.miniproject.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PremiumService {
    
    private final PremiumCalculationRepository calculationRepository;
    private final PolicySubscriptionRepository subscriptionRepository;
    private final UsageDataRepository usageRepository;
    private final PremiumRuleEngine ruleEngine;
    
    @Transactional
    public PremiumCalculation calculatePremium(Long subscriptionId, Long usageId) {
        PolicySubscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        UsageData usage = usageRepository.findById(usageId)
                .orElseThrow(() -> new ResourceNotFoundException("Usage data not found"));
        
        double basePremium = subscription.getPolicy().getBasePremium();
        Map<String, Double> calculation = ruleEngine.calculatePremium(usage, basePremium);
        
        PremiumCalculation premium = new PremiumCalculation();
        premium.setSubscription(subscription);
        premium.setUsage(usage);
        premium.setBasePremium(calculation.get("basePremium"));
        premium.setTotalAdditions(calculation.get("totalAdditions"));
        premium.setTotalDiscounts(calculation.get("totalDiscounts"));
        premium.setFinalPremium(calculation.get("finalPremium"));
        
        return calculationRepository.save(premium);
    }
    
    public List<PremiumCalculation> getPremiumHistory(Long subscriptionId) {
        return calculationRepository.findBySubscription_SubscriptionId(subscriptionId);
    }
}
