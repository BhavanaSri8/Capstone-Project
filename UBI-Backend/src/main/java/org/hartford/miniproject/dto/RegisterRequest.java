package org.hartford.miniproject.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String fullName;
    
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    @Size(min = 6)
    private String password;
    
    private String phone;
    
    private Long roleId;

    private String roleName;

    @Min(18)
    @Max(100)
    private Integer age;
}
