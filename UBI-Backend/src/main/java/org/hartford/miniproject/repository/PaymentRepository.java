package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.Payment;
import org.hartford.miniproject.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    List<Payment> findByPolicyId(Long policyId);
    Optional<Payment> findByTransactionId(String transactionId);
    boolean existsByPolicyIdAndPaymentStatus(Long policyId, PaymentStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    Double sumTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('MONTHNAME', p.paymentDate) as month, SUM(p.amount) as total FROM Payment p WHERE p.paymentStatus = 'SUCCESS' GROUP BY FUNCTION('MONTHNAME', p.paymentDate), FUNCTION('MONTH', p.paymentDate) ORDER BY FUNCTION('MONTH', p.paymentDate)")
    List<Object[]> sumRevenueByMonth();

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE p.userId = :userId AND " +
            "(:status IS NULL OR p.paymentStatus = :status) AND " +
            "(:search IS NULL OR LOWER(p.transactionId) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Payment> findByUserIdAndStatusAndSearch(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("status") org.hartford.miniproject.entity.PaymentStatus status,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE " +
            "(:status IS NULL OR p.paymentStatus = :status) AND " +
            "(:search IS NULL OR LOWER(p.transactionId) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Payment> findByStatusAndSearch(
            @org.springframework.data.repository.query.Param("status") org.hartford.miniproject.entity.PaymentStatus status,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);
}
