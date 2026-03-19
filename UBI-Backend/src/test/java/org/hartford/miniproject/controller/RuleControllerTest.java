package org.hartford.miniproject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.miniproject.entity.PremiumRule;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.repository.PremiumRuleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class RuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PremiumRuleRepository ruleRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createRule_returnsCreated() throws Exception {
        PremiumRule rule = new PremiumRule();
        rule.setRuleId(1L);
        rule.setRuleName("Night Driving");

        when(ruleRepository.save(any(PremiumRule.class))).thenReturn(rule);

        mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rule)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ruleId").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllRules_returnsOk() throws Exception {
        PremiumRule rule = new PremiumRule();
        rule.setRuleId(2L);
        when(ruleRepository.findAll()).thenReturn(List.of(rule));

        mockMvc.perform(get("/api/rules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ruleId").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void activateRule_returnsOk() throws Exception {
        PremiumRule rule = new PremiumRule();
        rule.setRuleId(3L);
        rule.setIsActive(false);

        when(ruleRepository.findById(3L)).thenReturn(Optional.of(rule));
        when(ruleRepository.save(any(PremiumRule.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/rules/3/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteRule_returnsNoContent() throws Exception {
        doNothing().when(ruleRepository).deleteById(4L);

        mockMvc.perform(delete("/api/rules/4"))
                .andExpect(status().isNoContent());
    }
}
