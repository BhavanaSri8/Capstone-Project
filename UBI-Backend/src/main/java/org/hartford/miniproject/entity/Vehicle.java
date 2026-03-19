package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;
    
    @Column(unique = true, nullable = false)
    private String vehicleNumber;
    
    @Column(nullable = false)
    private String vehicleType;
    
    private Integer vehicleAge;
    
    private LocalDate registrationDate;
    
    private String status = "ACTIVE";
}
