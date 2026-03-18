package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.UsageData;

public class NightDrivingRuleStrategy implements PremiumRuleStrategy {
    private final String condition;
    private final double value;
    
    public NightDrivingRuleStrategy(String condition, double value) {
        this.condition = condition;
        this.value = value;
    }
    
    @Override
    public boolean evaluate(UsageData usage) {
        if (usage.getNightDrivingHours() == null) return false;

        // Handle conditions like "> 30", "< 10", or range conditions
        if (condition.contains("-")) {
            // Range condition: "10-20"
            String[] range = condition.split("-");
            double min = Double.parseDouble(range[0].trim());
            double max = Double.parseDouble(range[1].trim());
            return usage.getNightDrivingHours() >= min && usage.getNightDrivingHours() <= max;
        } else {
            // Comparison condition: "> 30" or "< 10"
            String[] parts = condition.split(" ");
            if (parts.length < 2) return false;
            double threshold = Double.parseDouble(parts[1].trim());
            return parts[0].equals(">") ? usage.getNightDrivingHours() > threshold : usage.getNightDrivingHours() < threshold;
        }
    }
    
    @Override
    public double getValue() { return value; }
    
    @Override
    public String getRuleType() {
        // ">" means surcharge/addition, "<" means discount
        // Range conditions should be treated as standard
        if (condition.contains("<")) return "DISCOUNT";
        if (condition.contains(">")) return "ADDITION";
        return "STANDARD"; // For range conditions
    }
}
