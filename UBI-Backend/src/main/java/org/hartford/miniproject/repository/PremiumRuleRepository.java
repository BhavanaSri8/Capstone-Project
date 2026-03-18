package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.PremiumRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PremiumRuleRepository extends JpaRepository<PremiumRule, Long> {
    List<PremiumRule> findByIsActive(Boolean isActive);
}
