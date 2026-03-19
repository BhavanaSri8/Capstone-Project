package org.hartford.miniproject.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.repository.UserRepository;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<User> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> profileData) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (profileData.containsKey("fullName")) {
            user.setFullName(profileData.get("fullName"));
        }
        if (profileData.containsKey("phone")) {
            user.setPhone(profileData.get("phone"));
        }
        if (profileData.containsKey("address")) {
            user.setAddress(profileData.get("address"));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }
}
