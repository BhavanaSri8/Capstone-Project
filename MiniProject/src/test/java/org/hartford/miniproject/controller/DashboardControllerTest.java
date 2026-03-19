package org.hartford.miniproject.controller;

import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getSummary_returnsOk() throws Exception {
        when(dashboardService.getDashboardSummary()).thenReturn(Map.of("totalUsers", 10L));

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMonthlyRevenue_returnsOk() throws Exception {
        when(dashboardService.getMonthlyRevenue()).thenReturn(1234.5);

        mockMvc.perform(get("/api/dashboard/monthly-revenue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(1234.5));
    }
}
