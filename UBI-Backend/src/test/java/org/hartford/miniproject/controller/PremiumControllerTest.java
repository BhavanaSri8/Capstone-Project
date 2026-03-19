package org.hartford.miniproject.controller;

import org.hartford.miniproject.entity.PremiumCalculation;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.PremiumService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class PremiumControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PremiumService premiumService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void calculatePremium_returnsOk() throws Exception {
        PremiumCalculation calculation = new PremiumCalculation();
        calculation.setCalculationId(11L);
        when(premiumService.calculatePremium(2L, 3L)).thenReturn(calculation);

        mockMvc.perform(post("/api/premium/calculate/2").param("usageId", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.calculationId").value(11));
    }

    @Test
    void getPremiumHistory_returnsOk() throws Exception {
        PremiumCalculation calculation = new PremiumCalculation();
        calculation.setCalculationId(21L);
        when(premiumService.getPremiumHistory(7L)).thenReturn(List.of(calculation));

        mockMvc.perform(get("/api/premium/history/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].calculationId").value(21));
    }
}
