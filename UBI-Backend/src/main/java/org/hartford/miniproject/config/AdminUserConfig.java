package org.hartford.miniproject.config;

import org.hartford.miniproject.entity.Role;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.repository.RoleRepository;
import org.hartford.miniproject.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@Order(2)
public class AdminUserConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserConfig(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static final String ADMIN_EMAIL = "bhavana@gmail.com";
    private static final String ADMIN_PASSWORD = "Bhavana@12";
    private static final String ADMIN_FULL_NAME = "Bhavana Admin";
    private static final String ADMIN_PHONE = "8753827182";

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        if (userRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
            return;
        }

        // Get or create ADMIN role
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseThrow(() -> new RuntimeException("ADMIN role not found. Please ensure DataInitializer runs first."));

        // Create admin user
        User adminUser = new User();
        adminUser.setFullName(ADMIN_FULL_NAME);
        adminUser.setEmail(ADMIN_EMAIL);
        adminUser.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        adminUser.setPhone(ADMIN_PHONE);
        adminUser.setRole(adminRole);
        adminUser.setStatus("ACTIVE");
        adminUser.setCreatedAt(LocalDateTime.now());

        userRepository.save(adminUser);
        System.out.println("✓ Admin user created successfully!");
        System.out.println("  Email: " + ADMIN_EMAIL);
        System.out.println("  Password: " + ADMIN_PASSWORD);
    }
}

