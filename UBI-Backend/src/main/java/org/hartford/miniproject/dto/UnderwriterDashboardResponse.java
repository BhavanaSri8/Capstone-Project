package org.hartford.miniproject.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnderwriterDashboardResponse {
    private long pendingApplications;
    private long approvedApplications;
    private long rejectedApplications;
    private long totalApplications;
    private long highRiskApplications;
}
