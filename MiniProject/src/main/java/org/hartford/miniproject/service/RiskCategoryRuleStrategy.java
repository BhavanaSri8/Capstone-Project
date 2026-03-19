package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.UsageData;

public class RiskCategoryRuleStrategy implements PremiumRuleStrategy {
    private final String condition;
    private final double value;
    
    public RiskCategoryRuleStrategy(String condition, double value) {
        this.condition = condition;
        this.value = value;
    }
    
    @Override
    public boolean evaluate(UsageData usage) {
        return usage.getRiskCategory() != null && usage.getRiskCategory().equalsIgnoreCase(condition);
    }
    
    @Override
    public double getValue() { return value; }
    
    @Override
    public String getRuleType() { return condition.equalsIgnoreCase("LOW") ? "DISCOUNT" : "ADDITION"; }
}
