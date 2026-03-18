package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.VehicleSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleSubscriptionRepository extends JpaRepository<VehicleSubscription, Long> {
    List<VehicleSubscription> findBySubscription_SubscriptionId(Long subscriptionId);
    boolean existsBySubscription_SubscriptionIdAndVehicle_VehicleId(Long subscriptionId, Long vehicleId);
    Optional<VehicleSubscription> findFirstByVehicle_VehicleIdAndSubscription_Policy_PolicyIdAndSubscription_SubscriptionStatus(
            Long vehicleId,
            Long policyId,
            String subscriptionStatus
    );
}
