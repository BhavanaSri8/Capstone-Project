package org.hartford.miniproject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.miniproject.dto.ClaimResponse;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.ClaimService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClaimService claimService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void raiseClaim_returnsCreated() throws Exception {
        ClaimResponse response = new ClaimResponse(1L, 10L, 1000.0, "accident", "PENDING", LocalDateTime.now(), null, "John Doe", "Basic Plan", "PAID", List.of());
        when(claimService.raiseClaim(any())).thenReturn(response);

        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "subscriptionId", 10,
                                "claimAmount", 1000.0,
                                "claimReason", "accident"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.claimId").value(1));
    }

    @Test
    void raiseClaimWithDocuments_returnsCreated() throws Exception {
        ClaimResponse response = new ClaimResponse(2L, 10L, 900.0, "glass", "PENDING", LocalDateTime.now(), null, "John Doe", "Basic Plan", "PAID", List.of("proof.pdf"));
        when(claimService.raiseClaim(any(), anyList())).thenReturn(response);

        mockMvc.perform(multipart("/api/claims")
                        .file("documents", "dummy".getBytes())
                        .param("subscriptionId", "10")
                        .param("claimAmount", "900")
                        .param("claimReason", "glass")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.claimId").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void approveClaim_returnsOk() throws Exception {
        ClaimResponse response = new ClaimResponse(3L, 10L, 700.0, "damage", "APPROVED", LocalDateTime.now(), "Admin", "John Doe", "Basic Plan", "PAID", List.of());
        when(claimService.approveClaim(3L)).thenReturn(response);

        mockMvc.perform(put("/api/claims/3/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimStatus").value("APPROVED"));
    }

    @Test
    @WithMockUser(roles = "CLAIMS_OFFICER")
    void downloadDocument_pdfReturnsBytes() throws Exception {
        byte[] fileData = "content".getBytes();
        when(claimService.getDocumentBytes(5L, "proof.pdf")).thenReturn(fileData);

        mockMvc.perform(get("/api/claims/5/documents/proof.pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"proof.pdf\""))
                .andExpect(content().contentType("application/pdf"))
                .andExpect(content().bytes(fileData));
    }
}
