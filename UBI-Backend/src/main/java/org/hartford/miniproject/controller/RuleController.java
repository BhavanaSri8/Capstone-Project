package org.hartford.miniproject.controller;

import lombok.*;
import org.hartford.miniproject.entity.PremiumRule;
import org.hartford.miniproject.repository.PremiumRuleRepository;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RuleController {
    
    private final PremiumRuleRepository ruleRepository;
    
    @PostMapping
    public ResponseEntity<PremiumRule> createRule(@RequestBody PremiumRule rule) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleRepository.save(rule));
    }
    
    @GetMapping
    public ResponseEntity<List<PremiumRule>> getAllRules() {
        return ResponseEntity.ok(ruleRepository.findAll());
    }
    
    @PutMapping("/{ruleId}/activate")
    public ResponseEntity<PremiumRule> activateRule(@PathVariable Long ruleId) {
        PremiumRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        rule.setIsActive(true);
        return ResponseEntity.ok(ruleRepository.save(rule));
    }
    
    @PutMapping("/{ruleId}/deactivate")
    public ResponseEntity<PremiumRule> deactivateRule(@PathVariable Long ruleId) {
        PremiumRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        rule.setIsActive(false);
        return ResponseEntity.ok(ruleRepository.save(rule));
    }
    
    @PutMapping("/{ruleId}")
    public ResponseEntity<PremiumRule> updateRule(@PathVariable Long ruleId, @RequestBody PremiumRule updatedRule) {
        PremiumRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        rule.setRuleName(updatedRule.getRuleName());
        rule.setRuleType(updatedRule.getRuleType());
        rule.setCondition(updatedRule.getCondition());
        rule.setValue(updatedRule.getValue());
        rule.setDescription(updatedRule.getDescription());
        return ResponseEntity.ok(ruleRepository.save(rule));
    }
    
    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long ruleId) {
        ruleRepository.deleteById(ruleId);
        return ResponseEntity.noContent().build();
    }
}
