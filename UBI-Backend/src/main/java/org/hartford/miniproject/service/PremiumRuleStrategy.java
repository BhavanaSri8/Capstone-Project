package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.UsageData;

public interface PremiumRuleStrategy {
    boolean evaluate(UsageData usage);
    double getValue();
    String getRuleType();
}
