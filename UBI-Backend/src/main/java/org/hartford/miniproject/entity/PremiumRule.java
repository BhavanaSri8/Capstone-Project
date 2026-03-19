package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "premium_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PremiumRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ruleId;
    
    @Column(nullable = false)
    private String ruleName;
    
    private String ruleType;
    
    @Column(name = "rule_condition")
    private String condition;
    
    @Column(name = "rule_value")
    private Double value;
    
    private Boolean isActive = true;
    
    private String description;
}
