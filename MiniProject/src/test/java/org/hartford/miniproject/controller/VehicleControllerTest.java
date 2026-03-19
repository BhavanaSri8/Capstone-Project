package org.hartford.miniproject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.miniproject.dto.VehicleResponse;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.hartford.miniproject.service.VehicleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void registerVehicle_returnsCreated() throws Exception {
        VehicleResponse response = new VehicleResponse(1L, "TS09AB1234", "CAR", 2, LocalDate.of(2024, 1, 1), "ACTIVE");
        when(vehicleService.createVehicle(any())).thenReturn(response);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "vehicleNumber", "TS09AB1234",
                                "vehicleType", "CAR"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.vehicleId").value(1));
    }

    @Test
    void getAllVehicles_returnsOk() throws Exception {
        VehicleResponse response = new VehicleResponse(2L, "TS09AB8888", "BIKE", 1, LocalDate.of(2025, 1, 1), "ACTIVE");
        when(vehicleService.getFilteredVehicles(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].vehicleId").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteVehicle_returnsNoContent() throws Exception {
        doNothing().when(vehicleService).deleteVehicle(3L);

        mockMvc.perform(delete("/api/vehicles/3"))
                .andExpect(status().isNoContent());
    }
}
