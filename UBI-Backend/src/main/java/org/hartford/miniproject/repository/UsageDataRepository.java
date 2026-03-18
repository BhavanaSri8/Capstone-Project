package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.UsageData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsageDataRepository extends JpaRepository<UsageData, Long> {
    List<UsageData> findBySubscription_SubscriptionId(Long subscriptionId);
    Optional<UsageData> findBySubscription_SubscriptionIdAndBillingMonthAndBillingYear(Long subscriptionId, Integer month, Integer year);
    List<UsageData> findByRiskCategory(String riskCategory);
    long countByRiskCategory(String riskCategory);
    List<UsageData> findAllBySubscription_Order_OrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(u.totalDistanceKm) FROM UsageData u")
    Double getAverageDistanceTravelled();

    @org.springframework.data.jpa.repository.Query("SELECT AVG(u.nightDrivingHours) FROM UsageData u")
    Double getAverageNightDrivingHours();
}
