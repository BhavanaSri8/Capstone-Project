package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.PremiumCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PremiumCalculationRepository extends JpaRepository<PremiumCalculation, Long> {
    List<PremiumCalculation> findBySubscription_SubscriptionId(Long subscriptionId);
}
