package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.repository.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PremiumRuleEngine {
    
    private final PremiumRuleRepository ruleRepository;
    
    public Map<String, Double> calculatePremium(UsageData usage, double basePremium) {
        List<PremiumRule> activeRules = ruleRepository.findByIsActive(true);
        double totalAdditions = 0;
        double totalDiscounts = 0;
        
        for (PremiumRule rule : activeRules) {
            PremiumRuleStrategy strategy = createStrategy(rule);
            if (strategy != null && strategy.evaluate(usage)) {
                String ruleType = strategy.getRuleType();
                if (ruleType.equals("ADDITION")) {
                    totalAdditions += strategy.getValue();
                } else if (ruleType.equals("DISCOUNT")) {
                    totalDiscounts += strategy.getValue();
                }
            }
        }
        
        Map<String, Double> result = new HashMap<>();
        result.put("basePremium", basePremium);
        result.put("totalAdditions", totalAdditions);
        result.put("totalDiscounts", totalDiscounts);
        result.put("finalPremium", Math.max(0, basePremium + totalAdditions - totalDiscounts));
        return result;
    }
    
    private PremiumRuleStrategy createStrategy(PremiumRule rule) {
        return switch (rule.getRuleType().toUpperCase()) {
            case "DISTANCE" -> new DistanceRuleStrategy(rule.getCondition(), rule.getValue());
            case "NIGHT_DRIVING" -> new NightDrivingRuleStrategy(rule.getCondition(), rule.getValue());
            case "RISK_CATEGORY" -> new RiskCategoryRuleStrategy(rule.getCondition(), rule.getValue());
            default -> null;
        };
    }
}
