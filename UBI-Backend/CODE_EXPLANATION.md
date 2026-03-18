# Backend Code Explanation - File by File

## 📁 Main Application

### **MiniProjectApplication.java**
```java
@SpringBootApplication
public class MiniProjectApplication {
    public static void main(String[] args) {
        SpringApplication.run(MiniProjectApplication.class, args);
    }
}
```
**What it does**: Entry point of Spring Boot application. Starts the server on port 8080.

---

## 📁 entity/ - Database Tables

### **User.java**
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue
    private Long userId;           // Primary key
    private String fullName;       // User's full name
    private String email;          // Unique email
    private String password;       // Encrypted password
    private String phone;          // Phone number
    @ManyToOne
    private Role role;             // User's role (ADMIN/CUSTOMER/etc)
    private String status;         // ACTIVE/INACTIVE
}
```
**What it does**: Represents users table. Stores user information.

### **Role.java**
```java
@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue
    private Long roleId;
    private String roleName;  // ADMIN, CUSTOMER, AGENT, CLAIMS_OFFICER
}
```
**What it does**: Stores user roles. 4 roles created on startup.

### **Policy.java**
```java
@Entity
public class Policy {
    @Id @GeneratedValue
    private Long policyId;
    private String policyName;      // e.g., "Basic Coverage"
    private String coverageType;    // e.g., "COMPREHENSIVE"
    private Double basePremium;     // Base price (e.g., 3000)
    private String description;
    private Boolean isActive;       // Can be activated/deactivated
}
```
**What it does**: Insurance policies that customers can buy.

### **PolicyOrder.java**
```java
@Entity
public class PolicyOrder {
    @Id @GeneratedValue
    private Long orderId;
    private LocalDateTime orderDate;
    private String orderStatus;  // PENDING, APPROVED, REJECTED
    @ManyToOne
    private User user;           // Who ordered
    @ManyToOne
    private Policy policy;       // Which policy
}
```
**What it does**: When customer orders a policy. Needs approval.

### **PolicySubscription.java**
```java
@Entity
public class PolicySubscription {
    @Id @GeneratedValue
    private Long subscriptionId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String subscriptionStatus;  // ACTIVE, EXPIRED, CANCELLED
    @ManyToOne
    private User user;
    @ManyToOne
    private Policy policy;
}
```
**What it does**: Active policy after order approval. Links user to policy.

### **Vehicle.java**
```java
@Entity
public class Vehicle {
    @Id @GeneratedValue
    private Long vehicleId;
    private String vehicleNumber;  // e.g., "MH12AB1234"
    private String vehicleType;    // CAR, BIKE, SUV
    private Integer vehicleAge;
    private String status;
    @ManyToOne
    private User owner;
}
```
**What it does**: Customer's vehicles that are insured.

### **UsageData.java**
```java
@Entity
public class UsageData {
    @Id @GeneratedValue
    private Long usageId;
    private Integer billingMonth;
    private Integer billingYear;
    private Double totalDistanceKm;     // How much driven
    private Double nightDrivingHours;   // Night driving
    private Integer tripCount;
    private String riskCategory;        // LOW, MEDIUM, HIGH
    @ManyToOne
    private PolicySubscription subscription;
}
```
**What it does**: Monthly driving data. Used to calculate premium.

### **PremiumRule.java**
```java
@Entity
public class PremiumRule {
    @Id @GeneratedValue
    private Long ruleId;
    private String ruleName;
    private String ruleType;     // DISTANCE, NIGHT_DRIVING, RISK_CATEGORY
    private String condition;    // e.g., "> 10000"
    private Double value;        // Adjustment amount
    private Boolean isActive;
}
```
**What it does**: Rules for calculating premium. Admin can create/modify.

### **PremiumCalculation.java**
```java
@Entity
public class PremiumCalculation {
    @Id @GeneratedValue
    private Long calculationId;
    private Double basePremium;
    private Double totalPremium;
    private LocalDateTime calculationDate;
    @ManyToOne
    private PolicySubscription subscription;
    @ManyToOne
    private UsageData usageData;
}
```
**What it does**: Stores premium calculation history.

### **Claim.java**
```java
@Entity
public class Claim {
    @Id @GeneratedValue
    private Long claimId;
    private Double claimAmount;
    private String claimReason;
    private LocalDate claimDate;
    private String claimStatus;  // PENDING, APPROVED, REJECTED
    @ManyToOne
    private PolicySubscription subscription;
}
```
**What it does**: Insurance claims filed by customers.

---

## 📁 controller/ - REST API Endpoints

### **AuthController.java**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```
**What it does**: 
- `/register` - Creates new user account
- `/login` - Authenticates user, returns JWT token

### **PolicyController.java**
```java
@RestController
@RequestMapping("/api/policies")
public class PolicyController {
    @PostMapping  // Create policy (Admin only)
    @GetMapping   // Get all policies
    @GetMapping("/{id}")  // Get one policy
    @PutMapping("/{id}/status")  // Activate/Deactivate
}
```
**What it does**: CRUD operations for policies.

### **VehicleController.java**
```java
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    @PostMapping  // Register vehicle
    @GetMapping   // Get all vehicles
    @GetMapping("/{id}")  // Get one vehicle
    @PutMapping("/{id}")  // Update vehicle
    @DeleteMapping("/{id}")  // Delete vehicle
}
```
**What it does**: Manage customer vehicles.

### **PolicyOrderController.java**
```java
@RestController
@RequestMapping("/api/policy-orders")
public class PolicyOrderController {
    @PostMapping  // Create order
    @GetMapping   // Get all orders
    @PutMapping("/{id}/approve")  // Approve order
    @PutMapping("/{id}/reject")   // Reject order
}
```
**What it does**: Handle policy orders and approvals.

### **UsageController.java**
```java
@RestController
@RequestMapping("/api/usage")
public class UsageController {
    @PostMapping  // Add monthly usage data
    @GetMapping("/subscription/{id}")  // Get usage history
}
```
**What it does**: Track vehicle usage data.

### **PremiumController.java**
```java
@RestController
@RequestMapping("/api/premium")
public class PremiumController {
    @PostMapping("/calculate/{subscriptionId}")  // Calculate premium
    @GetMapping("/history/{subscriptionId}")     // Get history
}
```
**What it does**: Calculate premiums based on usage and rules.

### **ClaimController.java**
```java
@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    @PostMapping  // Raise claim
    @GetMapping   // Get all claims
    @PutMapping("/{id}/approve")  // Approve claim
    @PutMapping("/{id}/reject")   // Reject claim
}
```
**What it does**: Manage insurance claims.

### **DashboardController.java**
```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @GetMapping("/summary")  // Get dashboard stats
    @GetMapping("/risk-distribution")  // Risk breakdown
    @GetMapping("/monthly-revenue")    // Revenue calculation
}
```
**What it does**: Provide dashboard statistics.

---

## 📁 service/ - Business Logic

### **AuthService.java**
```java
@Service
public class AuthService {
    public AuthResponse register(RegisterRequest request) {
        // 1. Check if email exists
        // 2. Get role from database
        // 3. Create user with encrypted password
        // 4. Save to database
        // 5. Generate JWT token
        // 6. Return token + user info
    }
    
    public AuthResponse login(LoginRequest request) {
        // 1. Authenticate credentials
        // 2. Find user in database
        // 3. Generate JWT token
        // 4. Return token + user info
    }
}
```
**What it does**: Handles registration and login logic.

### **PremiumService.java**
```java
@Service
public class PremiumService {
    public PremiumCalculation calculatePremium(Long subscriptionId, Long usageId) {
        // 1. Get subscription and usage data
        // 2. Get base premium from policy
        // 3. Get all active rules
        // 4. Apply rules using PremiumRuleEngine
        // 5. Calculate total premium
        // 6. Save calculation
        // 7. Return result
    }
}
```
**What it does**: Orchestrates premium calculation.

### **PremiumRuleEngine.java**
```java
@Service
public class PremiumRuleEngine {
    public Double applyRules(Double basePremium, UsageData usage, List<PremiumRule> rules) {
        Double total = basePremium;
        for (PremiumRule rule : rules) {
            // Select strategy based on rule type
            PremiumRuleStrategy strategy = getStrategy(rule.getRuleType());
            // Apply rule
            total = strategy.apply(total, usage, rule);
        }
        return total;
    }
}
```
**What it does**: Applies premium rules using Strategy Pattern.

### **DistanceRuleStrategy.java**
```java
@Component
public class DistanceRuleStrategy implements PremiumRuleStrategy {
    public Double apply(Double premium, UsageData usage, PremiumRule rule) {
        // Parse condition (e.g., "> 10000")
        // Check if distance matches condition
        // If yes, add/subtract rule value
        // Return adjusted premium
    }
}
```
**What it does**: Calculates premium based on distance driven.

### **NightDrivingRuleStrategy.java**
```java
@Component
public class NightDrivingRuleStrategy implements PremiumRuleStrategy {
    public Double apply(Double premium, UsageData usage, PremiumRule rule) {
        // Check night driving hours
        // Apply surcharge if exceeds threshold
    }
}
```
**What it does**: Adds surcharge for night driving.

### **RiskCategoryRuleStrategy.java**
```java
@Component
public class RiskCategoryRuleStrategy implements PremiumRuleStrategy {
    public Double apply(Double premium, UsageData usage, PremiumRule rule) {
        // Check risk category (LOW/MEDIUM/HIGH)
        // Apply adjustment based on risk
    }
}
```
**What it does**: Adjusts premium based on risk level.

---

## 📁 repository/ - Database Access

### **UserRepository.java**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
}
```
**What it does**: Database queries for User table.

### **PolicyRepository.java**
```java
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByIsActive(Boolean isActive);
}
```
**What it does**: Database queries for Policy table.

---

## 📁 security/ - JWT & Authentication

### **JwtUtil.java**
```java
@Component
public class JwtUtil {
    public String generateToken(String email, String role) {
        // Create JWT with email and role
        // Set expiration time
        // Sign with secret key
        // Return token string
    }
    
    public String extractEmail(String token) {
        // Parse token and get email
    }
    
    public Boolean validateToken(String token, UserDetails user) {
        // Check if token is valid and not expired
    }
}
```
**What it does**: Creates and validates JWT tokens.

### **JwtAuthenticationFilter.java**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest request, ...) {
        // 1. Get token from Authorization header
        // 2. Extract email from token
        // 3. Load user details
        // 4. Validate token
        // 5. Set authentication in SecurityContext
    }
}
```
**What it does**: Intercepts requests to check JWT token.

### **CustomUserDetailsService.java**
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    public UserDetails loadUserByUsername(String email) {
        // Find user by email
        // Return UserDetails with authorities
    }
}
```
**What it does**: Loads user for Spring Security.

---

## 📁 config/ - Configuration

### **SecurityConfig.java**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtFilter, ...);
    }
}
```
**What it does**: Configures Spring Security with JWT.

### **DataInitializer.java**
```java
@Component
public class DataInitializer {
    @PostConstruct
    public void init() {
        // Create 4 roles: ADMIN, AGENT, CUSTOMER, CLAIMS_OFFICER
    }
}
```
**What it does**: Creates default roles on startup.

---

## 📁 dto/ - Request/Response Objects

### **RegisterRequest.java**
```java
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private Long roleId;
}
```
**What it does**: Input for registration.

### **AuthResponse.java**
```java
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long userId;
}
```
**What it does**: Response after login/register.

---

## 📁 exception/ - Error Handling

### **GlobalExceptionHandler.java**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(Exception ex) {
        // Return 404 error
    }
    
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception ex) {
        // Return 400 error
    }
}
```
**What it does**: Catches exceptions and returns proper error responses.

---

## 🔄 How Code Flows

### Example: User Login
```
1. POST /api/auth/login
2. AuthController.login() receives request
3. Calls AuthService.login()
4. AuthService authenticates with Spring Security
5. Finds user in database via UserRepository
6. Generates JWT token via JwtUtil
7. Returns AuthResponse with token
```

### Example: Calculate Premium
```
1. POST /api/premium/calculate/1?usageId=1
2. PremiumController.calculatePremium() receives request
3. Calls PremiumService.calculatePremium()
4. Gets subscription from PolicySubscriptionRepository
5. Gets usage data from UsageDataRepository
6. Gets active rules from PremiumRuleRepository
7. Calls PremiumRuleEngine.applyRules()
8. For each rule, selects strategy and applies
9. Saves calculation to PremiumCalculationRepository
10. Returns PremiumCalculation result
```

---

## 🎯 Key Concepts

**@Entity**: Marks class as database table
**@RestController**: Marks class as REST API controller
**@Service**: Marks class as business logic service
**@Repository**: Marks interface as database access layer
**@Autowired/@RequiredArgsConstructor**: Dependency injection
**@PostMapping/@GetMapping**: HTTP method mapping
**@ManyToOne/@OneToMany**: Database relationships
**JpaRepository**: Provides CRUD methods automatically
**Strategy Pattern**: Different strategies for premium rules
**JWT**: Stateless authentication token
**BCrypt**: Password encryption
**Lombok**: Reduces boilerplate code (@Data, @NoArgsConstructor, etc.)

---

## 📊 Database Relationships

```
User ←→ Role (Many-to-One)
User → Vehicle (One-to-Many)
User → PolicyOrder (One-to-Many)
User → PolicySubscription (One-to-Many)
Policy → PolicyOrder (One-to-Many)
Policy → PolicySubscription (One-to-Many)
PolicySubscription → UsageData (One-to-Many)
PolicySubscription → Claim (One-to-Many)
PolicySubscription → PremiumCalculation (One-to-Many)
```

---

**This document explains WHAT code is in each file and WHY it exists.**
