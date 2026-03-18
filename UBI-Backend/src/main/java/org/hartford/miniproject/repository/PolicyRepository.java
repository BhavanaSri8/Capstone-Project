package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    @Query("SELECT p FROM Policy p WHERE " +
            "(:status IS NULL OR p.isActive = :status) AND " +
            "(:search IS NULL OR :search = '' " +
            "OR LOWER(p.policyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.coverageType) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Policy> findByStatusAndSearch(
            @Param("status") Boolean status,
            @Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    List<Policy> findByIsActive(Boolean isActive);
}
