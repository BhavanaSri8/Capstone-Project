package org.hartford.miniproject.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRequest {
    @NotNull
    private Long subscriptionId;
    
    @NotNull
    @Positive
    private Double claimAmount;
    
    @NotBlank
    private String claimReason;

    private List<MultipartFile> documents;
}
