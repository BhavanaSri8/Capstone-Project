package org.hartford.miniproject.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long vehicleId;
    private String vehicleNumber;
    private String vehicleType;
    private Integer vehicleAge;
    private LocalDate registrationDate;
    private String status;
}
