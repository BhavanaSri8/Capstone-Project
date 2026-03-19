package org.hartford.miniproject.service;

import org.hartford.miniproject.dto.VehicleRequest;
import org.hartford.miniproject.dto.VehicleResponse;
import org.hartford.miniproject.entity.Vehicle;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    @Test
    void createVehicle_whenNumberUnique_savesAndReturnsResponse() {
        VehicleRequest request = new VehicleRequest("TS09AB1234", "CAR", 2, LocalDate.of(2024, 1, 1));

        when(vehicleRepository.findByVehicleNumber("TS09AB1234")).thenReturn(Optional.empty());
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> {
            Vehicle vehicle = inv.getArgument(0);
            vehicle.setVehicleId(1L);
            return vehicle;
        });

        VehicleResponse response = vehicleService.createVehicle(request);

        assertEquals(1L, response.getVehicleId());
        assertEquals("TS09AB1234", response.getVehicleNumber());
    }

    @Test
    void createVehicle_whenDuplicateNumber_throwsBadRequest() {
        VehicleRequest request = new VehicleRequest("TS09AB1234", "CAR", 2, LocalDate.of(2024, 1, 1));
        when(vehicleRepository.findByVehicleNumber("TS09AB1234")).thenReturn(Optional.of(new Vehicle()));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> vehicleService.createVehicle(request));

        assertEquals("Vehicle number already exists", ex.getMessage());
    }

    @Test
    void deleteVehicle_setsInactiveStatus() {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(7L);
        vehicle.setStatus("ACTIVE");
        when(vehicleRepository.findById(7L)).thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(7L);

        assertEquals("INACTIVE", vehicle.getStatus());
        verify(vehicleRepository).save(vehicle);
    }
}
