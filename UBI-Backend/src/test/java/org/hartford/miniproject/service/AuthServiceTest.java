package org.hartford.miniproject.service;

import org.hartford.miniproject.dto.AuthResponse;
import org.hartford.miniproject.dto.LoginRequest;
import org.hartford.miniproject.dto.RegisterRequest;
import org.hartford.miniproject.dto.RegisterResponse;
import org.hartford.miniproject.entity.Role;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.repository.RoleRepository;
import org.hartford.miniproject.repository.UserRepository;
import org.hartford.miniproject.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_createsUserAndReturnsResponse() {
        RegisterRequest request = new RegisterRequest("User", "user@mail.com", "secret12", "999999", 1L);
        Role role = new Role(1L, "CUSTOMER");

        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.empty());
        when(roleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("secret12")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setUserId(7L);
            return user;
        });

        RegisterResponse response = authService.register(request);

        assertEquals("user@mail.com", response.getEmail());
        assertEquals(7L, response.getUserId());
    }

    @Test
    void login_returnsJwtResponse() {
        LoginRequest request = new LoginRequest("user@mail.com", "secret12");
        Role role = new Role(2L, "ADMIN");
        User user = new User();
        user.setUserId(4L);
        user.setEmail("user@mail.com");
        user.setRole(role);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("user@mail.com", "ADMIN")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt-token", response.getToken());
        assertEquals("ADMIN", response.getRole());
        assertEquals(4L, response.getUserId());
    }
}
