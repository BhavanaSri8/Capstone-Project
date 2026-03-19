package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.Claim;
import org.hartford.miniproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findBySubscription_SubscriptionId(Long subscriptionId);
    List<Claim> findByClaimStatus(String status);

    long countBySubscription_Order_User_UserIdAndClaimStatus(Long userId, String status);
    
    // Atomic update - only succeeds if claim is still PENDING
    @Modifying
    @Query("UPDATE Claim c SET c.claimStatus = :status, c.reviewedBy = :reviewer " +
           "WHERE c.claimId = :claimId AND c.claimStatus = 'PENDING'")
    int updateClaimStatus(@Param("claimId") Long claimId, 
                          @Param("status") String status, 
                          @Param("reviewer") User reviewer);

    @Query("SELECT c FROM Claim c WHERE " +
           "(:status IS NULL OR c.claimStatus = :status) AND " +
           "(:search IS NULL OR LOWER(c.claimReason) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.subscription.order.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Claim> findByStatusAndSearch(
            @Param("status") String status,
            @Param("search") String search,
            org.springframework.data.domain.Pageable pageable);
}
