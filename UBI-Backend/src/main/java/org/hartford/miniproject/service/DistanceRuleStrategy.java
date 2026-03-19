package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.UsageData;

public class DistanceRuleStrategy implements PremiumRuleStrategy {
    private final String condition;
    private final double value;
    
    public DistanceRuleStrategy(String condition, double value) {
        this.condition = condition;
        this.value = value;
    }
    
    @Override
    public boolean evaluate(UsageData usage) {
        if (usage.getTotalDistanceKm() == null) return false;

        // Handle conditions like "> 10000", "< 5000", or "5000-10000"
        if (condition.contains("-")) {
            // Range condition: "5000-10000"
            String[] range = condition.split("-");
            double min = Double.parseDouble(range[0].trim());
            double max = Double.parseDouble(range[1].trim());
            return usage.getTotalDistanceKm() >= min && usage.getTotalDistanceKm() <= max;
        } else {
            // Comparison condition: "> 10000" or "< 5000"
            String[] parts = condition.split(" ");
            if (parts.length < 2) return false;
            double threshold = Double.parseDouble(parts[1].trim());
            return parts[0].equals(">") ? usage.getTotalDistanceKm() > threshold : usage.getTotalDistanceKm() < threshold;
        }
    }
    
    @Override
    public double getValue() { return value; }
    
    @Override
    public String getRuleType() {
        // ">" means surcharge/addition, "<" means discount
        // Range conditions like "5000-10000" should be treated based on rule name or as standard (no adjustment)
        if (condition.contains("<")) return "DISCOUNT";
        if (condition.contains(">")) return "ADDITION";
        return "STANDARD"; // For range conditions - no addition/discount
    }
}
