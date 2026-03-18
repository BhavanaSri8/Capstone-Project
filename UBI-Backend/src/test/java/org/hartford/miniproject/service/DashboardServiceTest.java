package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.PremiumCalculation;
import org.hartford.miniproject.repository.ClaimRepository;
import org.hartford.miniproject.repository.PolicyOrderRepository;
import org.hartford.miniproject.repository.PolicyRepository;
import org.hartford.miniproject.repository.PolicySubscriptionRepository;
import org.hartford.miniproject.repository.PremiumCalculationRepository;
import org.hartford.miniproject.repository.UsageDataRepository;
import org.hartford.miniproject.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private PolicyOrderRepository policyOrderRepository;

    @Mock
    private PolicySubscriptionRepository subscriptionRepository;

    @Mock
    private UsageDataRepository usageRepository;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private PremiumCalculationRepository calculationRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getDashboardSummary_returnsAggregatedMetrics() {
        when(userRepository.count()).thenReturn(10L);
        when(policyRepository.findByIsActive(true)).thenReturn(List.of(new org.hartford.miniproject.entity.Policy(), new org.hartford.miniproject.entity.Policy()));
        when(subscriptionRepository.count()).thenReturn(6L);
        when(claimRepository.count()).thenReturn(3L);
        when(policyOrderRepository.countByOrderStatus("PENDING")).thenReturn(2L);
        when(subscriptionRepository.findBySubscriptionStatus("ACTIVE")).thenReturn(List.of(new org.hartford.miniproject.entity.PolicySubscription()));
        when(calculationRepository.findAll()).thenReturn(List.of());

        Map<String, Object> summary = dashboardService.getDashboardSummary();

        assertEquals(10L, summary.get("totalUsers"));
        assertEquals(2, summary.get("totalPolicies"));
        assertEquals(2L, summary.get("pendingOrders"));
    }

    @Test
    void getMonthlyRevenue_countsOnlyCurrentMonth() {
        PremiumCalculation current = new PremiumCalculation();
        current.setCalculatedDate(YearMonth.now().atDay(1).atStartOfDay());
        current.setFinalPremium(1500.0);

        PremiumCalculation previous = new PremiumCalculation();
        previous.setCalculatedDate(LocalDateTime.now().minusMonths(1));
        previous.setFinalPremium(1000.0);

        when(calculationRepository.findAll()).thenReturn(List.of(current, previous));

        Double revenue = dashboardService.getMonthlyRevenue();

        assertEquals(1500.0, revenue);
    }
}
