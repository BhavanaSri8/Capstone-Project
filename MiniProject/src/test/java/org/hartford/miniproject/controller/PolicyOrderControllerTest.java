package org.hartford.miniproject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.miniproject.entity.PolicyOrder;
import org.hartford.miniproject.entity.PolicySubscription;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.PolicyOrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
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
class PolicyOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PolicyOrderService policyOrderService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void createOrder_returnsCreated() throws Exception {
        PolicyOrder order = new PolicyOrder();
        order.setOrderId(10L);

        when(policyOrderService.createOrder(1L, 2L, 3L)).thenReturn(order);

        mockMvc.perform(post("/api/policy-orders")
                        .param("userId", "1")
                        .param("policyId", "2")
                        .param("vehicleId", "3"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(10));

        verify(policyOrderService).createOrder(1L, 2L, 3L);
    }

    @Test
    void createOrderWithDocuments_returnsCreated() throws Exception {
        PolicyOrder order = new PolicyOrder();
        order.setOrderId(11L);

        when(policyOrderService.createOrderWithDocuments(eq(1L), eq(2L), eq(3L), anyList()))
                .thenReturn(order);

        // UI uses multipart but some fields are passed as parts. MockMvc needs MockMultipartFile for @RequestPart
        org.springframework.mock.web.MockMultipartFile docPart = new org.springframework.mock.web.MockMultipartFile("documents", "test.txt", "text/plain", "dummy".getBytes());
        org.springframework.mock.web.MockMultipartFile userPart = new org.springframework.mock.web.MockMultipartFile("userId", "", "text/plain", "1".getBytes());
        org.springframework.mock.web.MockMultipartFile policyPart = new org.springframework.mock.web.MockMultipartFile("policyId", "", "text/plain", "2".getBytes());
        org.springframework.mock.web.MockMultipartFile vehiclePart = new org.springframework.mock.web.MockMultipartFile("vehicleId", "", "text/plain", "3".getBytes());

        mockMvc.perform(multipart("/api/policy-orders")
                        .file(docPart)
                        .file(userPart)
                        .file(policyPart)
                        .file(vehiclePart)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(11));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllOrders_returnsOk() throws Exception {
        PolicyOrder first = new PolicyOrder();
        first.setOrderId(1L);
        PolicyOrder second = new PolicyOrder();
        second.setOrderId(2L);

        // Update mock to match the service method called by the controller
        when(policyOrderService.getFilteredOrders(any(), any(), any())).thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(first, second)));

        mockMvc.perform(get("/api/policy-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].orderId").value(1))
                .andExpect(jsonPath("$.content[1].orderId").value(2));
    }

    @Test
    void getOrdersByUser_returnsOk() throws Exception {
        PolicyOrder order = new PolicyOrder();
        order.setOrderId(20L);

        when(policyOrderService.getOrdersByUser(5L)).thenReturn(List.of(order));

        mockMvc.perform(get("/api/policy-orders/user/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderId").value(20));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void approveOrder_returnsSubscription() throws Exception {
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(99L);

        when(policyOrderService.approveOrder(7L)).thenReturn(subscription);

        mockMvc.perform(put("/api/policy-orders/7/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subscriptionId").value(99));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void rejectOrder_returnsOk() throws Exception {
        doNothing().when(policyOrderService).rejectOrder(8L);

        mockMvc.perform(put("/api/policy-orders/8/reject"))
                .andExpect(status().isOk());

        verify(policyOrderService).rejectOrder(8L);
    }

    @Test
    void downloadDocument_pdf_setsHeadersAndBody() throws Exception {
        byte[] bytes = "file-data".getBytes();
        when(policyOrderService.getDocumentBytes(9L, "proof.pdf")).thenReturn(bytes);

        mockMvc.perform(get("/api/policy-orders/9/documents/proof.pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"proof.pdf\""))
                .andExpect(content().contentType("application/pdf"))
                .andExpect(content().bytes(bytes));
    }

    @Test
    void getOrdersByUser_notFoundFromService_mapsTo404() throws Exception {
        when(policyOrderService.getOrdersByUser(404L)).thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(get("/api/policy-orders/user/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found"));
    }
}
