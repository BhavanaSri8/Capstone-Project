package org.hartford.miniproject.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    @NotBlank
    private String vehicleNumber;
    
    @NotBlank
    private String vehicleType;
    
    private Integer vehicleAge;
    
    private LocalDate registrationDate;
}
