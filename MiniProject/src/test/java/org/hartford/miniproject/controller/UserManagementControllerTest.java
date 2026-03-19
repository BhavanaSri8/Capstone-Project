package org.hartford.miniproject.controller;

import org.hartford.miniproject.config.AdminUserConfig;
import org.hartford.miniproject.entity.Role;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.repository.RoleRepository;
import org.hartford.miniproject.repository.UserRepository;
import org.hartford.miniproject.security.CustomUserDetailsService;
import org.hartford.miniproject.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class UserManagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private AdminUserConfig adminUserConfig;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_returnsOk() throws Exception {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("user@mail.com");
        when(userRepository.findBySearchAndRole(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(user)));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].userId").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUserRole_returnsOk() throws Exception {
        User user = new User();
        user.setUserId(5L);
        Role role = new Role();
        role.setRoleId(2L);
        role.setRoleName("ADMIN");

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(roleRepository.findById(2L)).thenReturn(Optional.of(role));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/admin/users/5/role").param("roleId", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role.roleName").value("ADMIN"));
    }
}
