package org.hartford.miniproject.controller;

import org.hartford.miniproject.entity.PolicySubscription;
import org.hartford.miniproject.entity.VehicleSubscription;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.PolicySubscriptionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class SubscriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PolicySubscriptionService subscriptionService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void getAllSubscriptions_returnsOk() throws Exception {
        PolicySubscription first = new PolicySubscription();
        first.setSubscriptionId(1L);
        PolicySubscription second = new PolicySubscription();
        second.setSubscriptionId(2L);

        // Update mock to match the service method called by the controller
        when(subscriptionService.getFilteredSubscriptions(any(), any(), any()))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(first, second)));

        mockMvc.perform(get("/api/subscriptions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].subscriptionId").value(1))
                .andExpect(jsonPath("$.content[1].subscriptionId").value(2));
    }

    @Test
    void getSubscriptionById_returnsOk() throws Exception {
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(55L);

        when(subscriptionService.getSubscriptionById(55L)).thenReturn(subscription);

        mockMvc.perform(get("/api/subscriptions/55"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subscriptionId").value(55));
    }

    @Test
    void getSubscriptionsByUser_returnsOk() throws Exception {
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(10L);

        // Update mock to match the service method called by the controller
        when(subscriptionService.getFilteredSubscriptionsForUser(eq(7L), any(), any(), any()))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(subscription)));

        mockMvc.perform(get("/api/subscriptions/user/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].subscriptionId").value(10));
    }

    @Test
    void updateStatus_returnsOk() throws Exception {
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(12L);
        subscription.setSubscriptionStatus("EXPIRED");

        when(subscriptionService.updateStatus(12L, "EXPIRED")).thenReturn(subscription);

        mockMvc.perform(put("/api/subscriptions/12/status").param("status", "EXPIRED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subscriptionId").value(12))
                .andExpect(jsonPath("$.subscriptionStatus").value("EXPIRED"));
    }

    @Test
    void renewSubscription_returnsOk() throws Exception {
        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(9L);
        subscription.setSubscriptionStatus("ACTIVE");

        when(subscriptionService.renewSubscription(9L)).thenReturn(subscription);

        mockMvc.perform(post("/api/subscriptions/9/renew"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subscriptionId").value(9));

        verify(subscriptionService).renewSubscription(9L);
    }

    @Test
    void attachVehicle_returnsCreated() throws Exception {
        VehicleSubscription vehicleSubscription = new VehicleSubscription();
        vehicleSubscription.setVehicleSubscriptionId(44L);

        when(subscriptionService.attachVehicle(5L, 6L)).thenReturn(vehicleSubscription);

        mockMvc.perform(post("/api/vehicle-subscriptions")
                        .param("subscriptionId", "5")
                        .param("vehicleId", "6"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.vehicleSubscriptionId").value(44));
    }

    @Test
    void getVehiclesBySubscription_returnsOk() throws Exception {
        VehicleSubscription vehicleSubscription = new VehicleSubscription();
        vehicleSubscription.setVehicleSubscriptionId(101L);

        when(subscriptionService.getVehiclesBySubscription(88L)).thenReturn(List.of(vehicleSubscription));

        mockMvc.perform(get("/api/vehicle-subscriptions/88"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vehicleSubscriptionId").value(101));
    }

    @Test
    void attachVehicle_badRequest_mapsTo400() throws Exception {
        when(subscriptionService.attachVehicle(1L, 2L))
                .thenThrow(new BadRequestException("This vehicle is already linked to the selected subscription"));

        mockMvc.perform(post("/api/vehicle-subscriptions")
                        .param("subscriptionId", "1")
                        .param("vehicleId", "2"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This vehicle is already linked to the selected subscription"));
    }
}
