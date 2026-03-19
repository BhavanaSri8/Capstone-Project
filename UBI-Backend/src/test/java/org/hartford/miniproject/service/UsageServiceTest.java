package org.hartford.miniproject.service;

import org.hartford.miniproject.dto.UsageRequest;
import org.hartford.miniproject.dto.UsageResponse;
import org.hartford.miniproject.entity.PolicySubscription;
import org.hartford.miniproject.entity.UsageData;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.repository.PolicySubscriptionRepository;
import org.hartford.miniproject.repository.UsageDataRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsageServiceTest {

    @Mock
    private UsageDataRepository usageRepository;

    @Mock
    private PolicySubscriptionRepository subscriptionRepository;

    @InjectMocks
    private UsageService usageService;

    @Test
    void addUsage_createsUsageWhenPeriodNotExists() {
        UsageRequest request = new UsageRequest(10L, 3, 2026, 200.0, 5.0, 10, "LOW");
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(10L);

        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(subscription));
        when(usageRepository.findBySubscription_SubscriptionIdAndBillingMonthAndBillingYear(10L, 3, 2026))
                .thenReturn(Optional.empty());
        when(usageRepository.save(any(UsageData.class))).thenAnswer(inv -> {
            UsageData usage = inv.getArgument(0);
            usage.setUsageId(1L);
            return usage;
        });

        UsageResponse response = usageService.addUsage(request);

        assertEquals(1L, response.getUsageId());
        assertEquals(10L, response.getSubscriptionId());
    }

    @Test
    void addUsage_whenDuplicatePeriod_throwsBadRequest() {
        UsageRequest request = new UsageRequest(10L, 3, 2026, 200.0, 5.0, 10, "LOW");
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(10L);

        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(subscription));
        when(usageRepository.findBySubscription_SubscriptionIdAndBillingMonthAndBillingYear(10L, 3, 2026))
                .thenReturn(Optional.of(new UsageData()));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> usageService.addUsage(request));

        assertEquals("Usage data already exists for this period", ex.getMessage());
    }
}
