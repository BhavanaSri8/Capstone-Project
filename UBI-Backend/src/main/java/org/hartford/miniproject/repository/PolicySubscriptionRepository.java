package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.PolicySubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PolicySubscriptionRepository extends JpaRepository<PolicySubscription, Long> {
    List<PolicySubscription> findByOrder_User_UserId(Long userId);
    List<PolicySubscription> findBySubscriptionStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM PolicySubscription s WHERE " +
            "(:status IS NULL OR s.subscriptionStatus = :status) AND " +
            "(:search IS NULL OR LOWER(s.policy.policyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(s.order.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<PolicySubscription> findByStatusAndSearch(
            @org.springframework.data.repository.query.Param("status") String status, 
            @org.springframework.data.repository.query.Param("search") String search, 
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM PolicySubscription s WHERE " +
            "s.order.user.userId = :userId AND " +
            "(:status IS NULL OR s.subscriptionStatus = :status) AND " +
            "(:search IS NULL OR LOWER(s.policy.policyName) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<PolicySubscription> findByUserIdAndStatusAndSearch(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("status") String status,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);
}
