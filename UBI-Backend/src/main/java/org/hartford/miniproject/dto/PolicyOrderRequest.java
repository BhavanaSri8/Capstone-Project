package org.hartford.miniproject.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyOrderRequest {
    @NotNull
    private Long policyId;
    
    // Note: File uploads are handled separately via multipart/form-data in the controller
}
