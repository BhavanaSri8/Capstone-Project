package org.hartford.miniproject.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private String type; // POLICY_APPROVAL, POLICY_REJECTION, CLAIM_UPDATE, etc.

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @JsonProperty("isRead")
    @Builder.Default
    private boolean isRead = false;
}
