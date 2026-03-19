package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UserIdOrderByTimestampDesc(Long userId);
    long countByUser_UserIdAndIsReadFalse(Long userId);
}
