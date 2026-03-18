package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.entity.Vehicle;
import org.hartford.miniproject.exception.*;
import org.hartford.miniproject.repository.VehicleRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {
    
    private final VehicleRepository vehicleRepository;
    
    public VehicleResponse createVehicle(VehicleRequest request) {
        if (vehicleRepository.findByVehicleNumber(request.getVehicleNumber()).isPresent()) {
            throw new BadRequestException("Vehicle number already exists");
        }
        
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setVehicleAge(request.getVehicleAge());
        vehicle.setRegistrationDate(request.getRegistrationDate());
        
        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }
    
    public Page<VehicleResponse> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<VehicleResponse> getFilteredVehicles(String status, String search, Pageable pageable) {
        return vehicleRepository.findByStatusAndSearch(status, search, pageable).map(this::toResponse);
    }
    
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        return toResponse(vehicle);
    }
    
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setVehicleAge(request.getVehicleAge());
        vehicle.setRegistrationDate(request.getRegistrationDate());
        
        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }
    
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        vehicle.setStatus("INACTIVE");
        vehicleRepository.save(vehicle);
    }
    
    private VehicleResponse toResponse(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getVehicleId(),
                vehicle.getVehicleNumber(),
                vehicle.getVehicleType(),
                vehicle.getVehicleAge(),
                vehicle.getRegistrationDate(),
                vehicle.getStatus()
        );
    }
}
