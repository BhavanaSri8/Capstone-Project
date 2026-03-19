package org.hartford.miniproject.config;

import org.hartford.miniproject.entity.Role;
import org.hartford.miniproject.repository.RoleRepository;
import org.hartford.miniproject.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {
    
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final org.hartford.miniproject.repository.PolicyRepository policyRepository;
    private final org.hartford.miniproject.repository.VehicleRepository vehicleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, 
                          UserRepository userRepository, 
                          org.hartford.miniproject.repository.PolicyRepository policyRepository,
                          org.hartford.miniproject.repository.VehicleRepository vehicleRepository,
                          org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.policyRepository = policyRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        ensureRoleExists("ADMIN");
        ensureRoleExists("UNDERWRITER");
        ensureRoleExists("CUSTOMER");
        ensureRoleExists("CLAIMS_OFFICER");

        createDefaultUser("admin@driveiq.com", "ADMIN", 35);
        createDefaultUser("underwriter@driveiq.com", "UNDERWRITER", 40);
        createDefaultUser("customer@example.com", "CUSTOMER", 22); // Young driver - high risk

        seedSamplePolicies();
        seedSampleVehicles();
    }

    private void seedSamplePolicies() {
        if (policyRepository.count() == 0) {
            org.hartford.miniproject.entity.Policy p1 = new org.hartford.miniproject.entity.Policy();
            p1.setPolicyName("Basic Auto Shield");
            p1.setCoverageType("COMPREHENSIVE");
            p1.setBasePremium(500.0);
            p1.setDescription("Basic coverage for your vehicle with standardized usage-based discounts.");
            p1.setIsActive(true);
            p1.setPolicyTermYears(1);
            policyRepository.save(p1);

            org.hartford.miniproject.entity.Policy p2 = new org.hartford.miniproject.entity.Policy();
            p2.setPolicyName("Premium Drive Guard");
            p2.setCoverageType("COLLISION");
            p2.setBasePremium(800.0);
            p2.setDescription("Premium protection for high-value vehicles with flexible driving hours.");
            p2.setIsActive(true);
            p2.setPolicyTermYears(2);
            policyRepository.save(p2);
        }
    }

    private void seedSampleVehicles() {
        if (vehicleRepository.count() == 0) {
            org.hartford.miniproject.entity.Vehicle v1 = new org.hartford.miniproject.entity.Vehicle();
            v1.setVehicleNumber("KA-01-AB-1234");
            v1.setVehicleType("SUV");
            v1.setVehicleAge(3);
            v1.setRegistrationDate(java.time.LocalDate.now().minusYears(3));
            v1.setStatus("ACTIVE");
            vehicleRepository.save(v1);

            org.hartford.miniproject.entity.Vehicle v2 = new org.hartford.miniproject.entity.Vehicle();
            v2.setVehicleNumber("TN-07-CD-5678");
            v2.setVehicleType("Sedan");
            v2.setVehicleAge(2);
            v2.setRegistrationDate(java.time.LocalDate.now().minusYears(2));
            v2.setStatus("ACTIVE");
            vehicleRepository.save(v2);
        }
    }

    private void createDefaultUser(String email, String roleName, int age) {
        if (userRepository.findByEmail(email).isEmpty()) {
            org.hartford.miniproject.entity.User user = new org.hartford.miniproject.entity.User();
            user.setFullName(roleName.charAt(0) + roleName.substring(1).toLowerCase() + " User");
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole(roleRepository.findByRoleName(roleName).get());
            user.setAge(age);
            userRepository.save(user);
        }
    }

    private void ensureRoleExists(String roleName) {
        if (!roleRepository.findByRoleName(roleName).isPresent()) {
            roleRepository.save(new Role(null, roleName));
        }
    }
}
