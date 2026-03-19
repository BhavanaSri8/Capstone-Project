package org.hartford.miniproject.service;

import org.hartford.miniproject.dto.*;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.*;
import org.hartford.miniproject.repository.*;
import org.hartford.miniproject.security.JwtUtil;
import org.springframework.security.authentication.*;
import org.hartford.miniproject.entity.PasswordResetToken;
import org.hartford.miniproject.repository.PasswordResetTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final PasswordResetTokenRepository tokenRepository;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager,
            EmailService emailService,
            NotificationService notificationService,
            PasswordResetTokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.tokenRepository = tokenRepository;
    }
    
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }
        
        // Public registration always gets CUSTOMER role
        Role role = roleRepository.findByRoleName("CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("CUSTOMER role not found"));
        
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAge(request.getAge());
        user.setRole(role);
        
        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        // Notify admins about new registration
        notificationService.notifyRole("ADMIN", "New Customer Registered", 
                user.getFullName() + " has joined the platform.", "NEW_REGISTRATION");

        return new RegisterResponse("Registration successful. Please login.", user.getEmail(), user.getUserId());
    }

    public AuthResponse createInternalUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        String roleName = request.getRoleName();
        if (roleName == null || (!roleName.equalsIgnoreCase("UNDERWRITER") && !roleName.equalsIgnoreCase("CLAIMS_OFFICER"))) {
            throw new BadRequestException("Invalid role for internal user creation. Use UNDERWRITER or CLAIMS_OFFICER.");
        }

        Role role = roleRepository.findByRoleName(roleName.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Role " + roleName + " not found"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAge(request.getAge());
        user.setRole(role);

        userRepository.save(user);

        // Send staff welcome email
        emailService.sendStaffAccountCreatedEmail(user.getEmail(), user.getFullName(), role.getRoleName());

        // Notify admins
        notificationService.notifyRole("ADMIN", "Staff Account Created", 
                "New " + role.getRoleName() + " account created for " + user.getFullName(), "STAFF_CREATED");

        return new AuthResponse(null, user.getEmail(), role.getRoleName(), user.getUserId());
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getRoleName());
        return new AuthResponse(token, user.getEmail(), user.getRole().getRoleName(), user.getUserId());
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            notificationService.notifyRole("ADMIN", "System Active", 
                "The notification system is now online. Welcome to the Admin Portal!", "SYSTEM_INFO");
        } catch (Exception e) {
            // Log and ignore during startup if roles not yet initialized
        }
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found"));

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        tokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new BadRequestException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }
}
