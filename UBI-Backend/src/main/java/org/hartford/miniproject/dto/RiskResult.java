package org.hartford.miniproject.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskResult {
    private Double score;
    private String level;
}

