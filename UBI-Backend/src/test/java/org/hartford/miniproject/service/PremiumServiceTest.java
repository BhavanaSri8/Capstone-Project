package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.Policy;
import org.hartford.miniproject.entity.PolicySubscription;
import org.hartford.miniproject.entity.PremiumCalculation;
import org.hartford.miniproject.entity.UsageData;
import org.hartford.miniproject.repository.PolicySubscriptionRepository;
import org.hartford.miniproject.repository.PremiumCalculationRepository;
import org.hartford.miniproject.repository.UsageDataRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PremiumServiceTest {

    @Mock
    private PremiumCalculationRepository calculationRepository;

    @Mock
    private PolicySubscriptionRepository subscriptionRepository;

    @Mock
    private UsageDataRepository usageRepository;

    @Mock
    private PremiumRuleEngine ruleEngine;

    @InjectMocks
    private PremiumService premiumService;

    @Test
    void calculatePremium_savesCalculatedValues() {
        Policy policy = new Policy();
        policy.setBasePremium(4000.0);
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(2L);
        subscription.setPolicy(policy);

        UsageData usage = new UsageData();
        usage.setUsageId(3L);

        when(subscriptionRepository.findById(2L)).thenReturn(Optional.of(subscription));
        when(usageRepository.findById(3L)).thenReturn(Optional.of(usage));
        when(ruleEngine.calculatePremium(usage, 4000.0)).thenReturn(Map.of(
                "basePremium", 4000.0,
                "totalAdditions", 500.0,
                "totalDiscounts", 100.0,
                "finalPremium", 4400.0
        ));
        when(calculationRepository.save(any(PremiumCalculation.class))).thenAnswer(inv -> inv.getArgument(0));

        PremiumCalculation result = premiumService.calculatePremium(2L, 3L);

        assertEquals(4400.0, result.getFinalPremium());
        assertEquals(500.0, result.getTotalAdditions());
    }

    @Test
    void getPremiumHistory_returnsRepositoryData() {
        PremiumCalculation calculation = new PremiumCalculation();
        calculation.setCalculationId(10L);

        when(calculationRepository.findBySubscription_SubscriptionId(2L)).thenReturn(List.of(calculation));

        List<PremiumCalculation> history = premiumService.getPremiumHistory(2L);

        assertEquals(1, history.size());
        assertEquals(10L, history.get(0).getCalculationId());
    }
}
