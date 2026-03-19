package org.hartford.miniproject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.miniproject.dto.UsageResponse;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.UsageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class UsageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsageService usageService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void addUsage_returnsCreated() throws Exception {
        UsageResponse response = new UsageResponse(1L, 10L, 3, 2026, 100.0, 2.0, 5, "LOW");
        when(usageService.addUsage(any())).thenReturn(response);

        mockMvc.perform(post("/api/usage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "subscriptionId", 10,
                                "billingMonth", 3,
                                "billingYear", 2026,
                                "totalDistanceKm", 100.0,
                                "nightDrivingHours", 2.0,
                                "tripCount", 5,
                                "riskCategory", "LOW"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usageId").value(1));
    }

    @Test
    void getUsageBySubscription_returnsOk() throws Exception {
        when(usageService.getUsageBySubscription(10L))
                .thenReturn(List.of(new UsageResponse(2L, 10L, 3, 2026, 100.0, 1.0, 4, "LOW")));

        mockMvc.perform(get("/api/usage/subscription/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].usageId").value(2));
    }
}
