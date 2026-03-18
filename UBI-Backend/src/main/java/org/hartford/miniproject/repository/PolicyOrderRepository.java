package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.PolicyOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PolicyOrderRepository extends JpaRepository<PolicyOrder, Long> {
    List<PolicyOrder> findByUser_UserId(Long userId);
    List<PolicyOrder> findByOrderStatus(String status);
    long countByOrderStatus(String status);
    long countByOrderStatusAndRiskLevel(String status, String riskLevel);

    @org.springframework.data.jpa.repository.Query("SELECT po FROM PolicyOrder po WHERE " +
            "(:status IS NULL OR po.orderStatus = :status) AND " +
            "(:search IS NULL OR :search = '' " +
            "OR LOWER(po.policy.policyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(po.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<PolicyOrder> findByStatusAndSearch(
            @org.springframework.data.repository.query.Param("status") String status, 
            @org.springframework.data.repository.query.Param("search") String search, 
            org.springframework.data.domain.Pageable pageable);
}
