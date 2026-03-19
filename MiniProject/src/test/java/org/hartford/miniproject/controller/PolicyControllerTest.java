package org.hartford.miniproject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.miniproject.dto.PolicyResponse;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.PolicyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

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
class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PolicyService policyService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createPolicy_returnsCreated() throws Exception {
        PolicyResponse response = new PolicyResponse(1L, "Comprehensive", "FULL", 5000.0, "desc", true, 10, 0.0, true, true, "none");
        when(policyService.createPolicy(any())).thenReturn(response);

        mockMvc.perform(post("/api/policies")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("policyName", "Comprehensive"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.policyId").value(1));
    }

    @Test
    void getAllPolicies_returnsOk() throws Exception {
        PolicyResponse response = new PolicyResponse(2L, "Third Party", "TP", 2500.0, "desc", true, 10, 0.0, false, false, "na");
        // Update mock to match the service method called by the controller
        when(policyService.getFilteredPolicies(any(), any(), any())).thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/policies").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].policyId").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deletePolicy_returnsNoContent() throws Exception {
        doNothing().when(policyService).deletePolicy(4L);

        mockMvc.perform(delete("/api/policies/4"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updatePolicyStatus_returnsOk() throws Exception {
        PolicyResponse response = new PolicyResponse(5L, "Policy", "FULL", 3000.0, "desc", false, 10, 0.0, false, false, "na");
        when(policyService.updatePolicyStatus(5L, false)).thenReturn(response);

        mockMvc.perform(put("/api/policies/5/status").param("isActive", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }
}
