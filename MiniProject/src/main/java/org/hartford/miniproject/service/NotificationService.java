package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.dto.NotificationResponse;
import org.hartford.miniproject.entity.Notification;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.repository.NotificationRepository;
import org.hartford.miniproject.repository.UserRepository;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUser_UserIdOrderByTimestampDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .timestamp(n.getTimestamp())
                .isRead(n.isRead())
                .build();
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUser_UserIdOrderByTimestampDesc(userId)
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void clearAll(Long userId) {
        List<Notification> notifications = notificationRepository.findByUser_UserIdOrderByTimestampDesc(userId);
        notificationRepository.deleteAll(notifications);
    }

    @Transactional
    public void notifyRole(String roleName, String title, String message, String type) {
        List<User> users = userRepository.findByRole_RoleName(roleName);
        for (User user : users) {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_UserIdAndIsReadFalse(userId);
    }
}
