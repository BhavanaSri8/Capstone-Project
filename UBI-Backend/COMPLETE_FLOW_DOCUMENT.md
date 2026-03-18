# Hartford Insurance Project - Complete Implementation Flow Document

**Prepared for Review**

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [User Authentication Flow](#user-authentication-flow)
3. [Password Recovery Flow](#password-recovery-flow)
4. [Premium Calculation Flow](#premium-calculation-flow)
5. [Database Schema](#database-schema)
6. [File Structure & Implementation Details](#file-structure--implementation-details)
7. [API Endpoints](#api-endpoints)
8. [Data Flow Diagrams](#data-flow-diagrams)

---

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│  Frontend (React/Angular) - Login UI, Dashboard, Claims     │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/JSON
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                        │
│  • AuthController.java         (Login/Register)            │
│  • PasswordRecoveryController.java (Password Mgmt)         │
│  • PolicyController.java       (Policies)                  │
│  • ClaimController.java        (Claims)                    │
│  • PremiumController.java      (Premium Calc)             │
└──────────────────┬──────────────────────────────────────────┘
                   │ Service Calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                          │
│  • AuthService.java                                        │
│  • PasswordRecoveryService.java                            │
│  • PremiumService.java                                     │
│  • PremiumRuleEngine.java                                  │
│  • ClaimService.java                                       │
│  • PolicyService.java                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ Database Operations
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER                          │
│  • UserRepository (JPA)                                    │
│  • PolicyRepository (JPA)                                  │
│  • ClaimRepository (JPA)                                   │
│  • PremiumCalculationRepository (JPA)                      │
│  • UsageDataRepository (JPA)                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ CRUD Operations
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  H2 Database (File-based: ./data/insurance_db.mv.db)      │
│  Tables: USERS, ROLES, POLICIES, CLAIMS, USAGE_DATA, etc  │
└─────────────────────────────────────────────────────────────┘
```

---

## User Authentication Flow

### Complete Login Process

#### File: `src/main/java/org/hartford/miniproject/controller/AuthController.java`
```
ENDPOINT: POST /api/auth/login
PURPOSE: User login with email/password
INPUT: LoginRequest DTO
OUTPUT: AuthResponse DTO with JWT token
```

#### File: `src/main/java/org/hartford/miniproject/dto/LoginRequest.java`
```
FIELDS:
- email: String (user email)
- password: String (user password)
VALIDATION:
- @NotBlank on email
- @NotBlank on password
```

#### File: `src/main/java/org/hartford/miniproject/dto/AuthResponse.java`
```
FIELDS:
- token: String (JWT token)
- email: String (user email)
- role: String (user role: ADMIN, CUSTOMER, CLAIMS_OFFICER)
- userId: Long (user ID)
```

#### File: `src/main/java/org/hartford/miniproject/service/AuthService.java`
```
METHOD: login(LoginRequest request)
STEPS:
1. AuthenticationManager.authenticate(username, password)
2. UserRepository.findByEmail(email)
3. JwtUtil.generateToken(email, roleName)
4. Return AuthResponse with token

SECURITY:
- Password verified by Spring Security
- BCrypt encoding used
- Exception thrown if credentials invalid
```

#### File: `src/main/java/org/hartford/miniproject/security/JwtUtil.java`
```
METHOD: generateToken(email, role)
STEPS:
1. Create JWT claims with email and role
2. Set expiration (24 hours)
3. Sign with secret key (HS256)
4. Return encoded token string

TOKEN FORMAT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{payload}.{signature}
EXPIRATION: 86400000 ms (24 hours)
SECRET: 5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
```

#### File: `src/main/java/org/hartford/miniproject/security/JwtAuthenticationFilter.java`
```
PURPOSE: Filter for all HTTP requests
STEPS:
1. Extract token from Authorization header
2. Validate token with JwtUtil
3. Extract email from token
4. Load user details (CustomUserDetailsService)
5. Set SecurityContext with authentication
6. Allow request to proceed if valid
7. Throw exception if invalid
```

#### File: `src/main/java/org/hartford/miniproject/security/CustomUserDetailsService.java`
```
METHOD: loadUserByUsername(email)
STEPS:
1. UserRepository.findByEmail(email)
2. If found, return UserDetails with password and roles
3. If not found, throw UsernameNotFoundException
4. Roles converted to GrantedAuthority objects
```

#### File: `src/main/java/org/hartford/miniproject/entity/User.java`
```
DATABASE TABLE: USERS
FIELDS:
- user_id: BIGINT (PK, auto-increment)
- email: VARCHAR(255) (unique)
- password: VARCHAR(255) (BCrypt encoded)
- full_name: VARCHAR(255)
- phone: VARCHAR(255)
- role_id: BIGINT (FK to ROLES)
- status: VARCHAR(50) (ACTIVE/INACTIVE)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### File: `src/main/java/org/hartford/miniproject/entity/Role.java`
```
DATABASE TABLE: ROLES
FIELDS:
- role_id: BIGINT (PK)
- role_name: VARCHAR(255)
  VALUES: ADMIN, CUSTOMER, CLAIMS_OFFICER

CREATED BY: src/main/java/org/hartford/miniproject/config/DataInitializer.java
CREATED AT: Application startup (Order 1)
```

#### File: `src/main/java/org/hartford/miniproject/config/AdminUserConfig.java`
```
PURPOSE: Create ADMIN user at startup
TRIGGER: CommandLineRunner.run() - Order 2
EXECUTION:
1. Check if admin already exists
2. Fetch ADMIN role from database
3. Create User object with:
   - email: bhavana@gmail.com
   - password: Bhavana@12 (BCrypt encoded)
   - full_name: Bhavana Admin
   - phone: 8753827182
   - role: ADMIN
   - status: ACTIVE
4. Save to database

PASSWORD ENCODING: PasswordEncoder.encode(password)
```

#### File: `src/main/java/org/hartford/miniproject/config/TestUserConfig.java`
```
PURPOSE: Create test users at startup
TRIGGER: CommandLineRunner.run() - Order 3
EXECUTION:
1. Create Claims Officer:
   - email: claims@insurance.com
   - password: Mike@12345
   - full_name: Claims Officer Mike
   - role: CLAIMS_OFFICER
   - status: ACTIVE

2. Create Customer:
   - email: customer@example.com
   - password: Customer@123
   - full_name: John Customer
   - role: CUSTOMER
   - status: ACTIVE

PERSISTENCE: Save to database via UserRepository
```

---

## Password Recovery Flow

### Complete Password Recovery Process

#### File: `src/main/java/org/hartford/miniproject/controller/PasswordRecoveryController.java`
```
ENDPOINTS:
1. POST /api/auth/password/forgot
   INPUT: email (query param)
   OUTPUT: Reset token
   PURPOSE: Request password reset

2. POST /api/auth/password/reset
   INPUT: PasswordResetRequest DTO
   OUTPUT: Success message
   PURPOSE: Reset forgotten password

3. POST /api/auth/password/change
   INPUT: PasswordChangeRequest DTO
   OUTPUT: Success message
   PURPOSE: Change password (logged in users)
```

#### File: `src/main/java/org/hartford/miniproject/dto/PasswordResetRequest.java`
```
PURPOSE: DTO for forgot password flow
FIELDS:
- email: String (user email)
- newPassword: String (new password, 8+ chars)
- confirmPassword: String (confirmation)
VALIDATION:
- @NotBlank on all fields
- @Size(min=8) on newPassword
- @Email on email
```

#### File: `src/main/java/org/hartford/miniproject/dto/PasswordChangeRequest.java`
```
PURPOSE: DTO for logged-in password change
FIELDS:
- email: String (user email)
- oldPassword: String (current password)
- newPassword: String (new password, 8+ chars)
- confirmPassword: String (confirmation)
VALIDATION:
- @NotBlank on all fields
- @Size(min=8) on newPassword
- @Email on email
```

#### File: `src/main/java/org/hartford/miniproject/service/PasswordRecoveryService.java`
```
METHOD 1: generateResetToken(email)
STEPS:
1. UserRepository.findByEmail(email)
2. Generate UUID token: UUID.randomUUID().toString()
3. Return token to user
4. In production: Store token with expiration in database

METHOD 2: resetPassword(email, newPassword)
STEPS:
1. UserRepository.findByEmail(email)
2. Validate password length (8+ characters)
3. Encode password: PasswordEncoder.encode(newPassword)
4. Update user password
5. Set updatedAt timestamp
6. Save to database

METHOD 3: changePassword(email, oldPassword, newPassword)
STEPS:
1. UserRepository.findByEmail(email)
2. Verify old password: PasswordEncoder.matches(oldPassword, stored)
3. If matches, encode new password
4. Update user password
5. Set updatedAt timestamp
6. Save to database
7. If not matches, throw IllegalArgumentException
```

---

## Premium Calculation Flow

### Complete Premium Calculation Process

#### File: `src/main/java/org/hartford/miniproject/controller/PremiumController.java`
```
ENDPOINT: POST /api/premium/calculate/{policyId}
INPUT PARAMS:
- policyId: Long (path variable)
- usageId: Long (query parameter)
OUTPUT: PremiumCalculation object
PURPOSE: Calculate final premium for a policy based on usage
```

#### File: `src/main/java/org/hartford/miniproject/service/PremiumService.java`
```
METHOD: calculatePremium(subscriptionId, usageId)
STEPS:
1. PolicySubscriptionRepository.findById(subscriptionId)
   - Fetch subscription details
   - Get base policy premium

2. UsageDataRepository.findById(usageId)
   - Fetch usage data for calculation
   - Contains: distance, night hours, vehicle risk category

3. PremiumRuleEngine.calculatePremium(usage, basePremium)
   - Call rule engine with usage and base premium
   - Returns map with calculations

4. Create PremiumCalculation object:
   - Set subscription
   - Set usage
   - Set basePremium (from policy)
   - Set totalAdditions (from rules)
   - Set totalDiscounts (from rules)
   - Set finalPremium (calculated)

5. PremiumCalculationRepository.save()
   - Persist to database

6. Return PremiumCalculation to controller

METHOD: getPremiumHistory(subscriptionId)
STEPS:
1. Query all premium calculations for subscription
2. Return list ordered by date
3. Used for premium tracking
```

#### File: `src/main/java/org/hartford/miniproject/service/PremiumRuleEngine.java`
```
ATTACHED FILE - Core Logic

METHOD: calculatePremium(usage, basePremium)
ALGORITHM:
1. Get all active rules: ruleRepository.findByIsActive(true)
2. Initialize: totalAdditions = 0, totalDiscounts = 0
3. For each rule:
   a. Create strategy: createStrategy(rule)
   b. Evaluate strategy: strategy.evaluate(usage)
   c. If true:
      - If ADDITION type: totalAdditions += value
      - If DISCOUNT type: totalDiscounts += value
4. Calculate final premium: max(0, basePremium + additions - discounts)
5. Return map with all values

MAP RETURNED:
{
  "basePremium": 5000.0,
  "totalAdditions": 1500.0,
  "totalDiscounts": 500.0,
  "finalPremium": 6000.0
}

METHOD: createStrategy(rule)
LOGIC:
- DISTANCE → DistanceRuleStrategy
- NIGHT_DRIVING → NightDrivingRuleStrategy
- RISK_CATEGORY → RiskCategoryRuleStrategy
- DEFAULT → null (rule type not recognized)
```

#### File: `src/main/java/org/hartford/miniproject/service/DistanceRuleStrategy.java`
```
IMPLEMENTS: PremiumRuleStrategy
PURPOSE: Calculate premium based on distance traveled

FIELDS:
- condition: String (distance threshold)
- value: Double (addition/discount amount)

METHOD: evaluate(usage)
LOGIC:
1. Get total distance from usage data
2. Compare with condition threshold
3. Return true if condition met, false otherwise
4. Example: If distance > 1000 km, add $500 to premium

METHOD: getValue()
- Returns the addition/discount value

METHOD: getRuleType()
- Returns "ADDITION" or "DISCOUNT"
```

#### File: `src/main/java/org/hartford/miniproject/service/NightDrivingRuleStrategy.java`
```
IMPLEMENTS: PremiumRuleStrategy
PURPOSE: Calculate premium based on night driving hours

FIELDS:
- condition: String (night hours threshold)
- value: Double (addition/discount amount)

METHOD: evaluate(usage)
LOGIC:
1. Get total night driving hours from usage data
2. Compare with condition threshold
3. Return true if condition met, false otherwise
4. Example: If night hours > 50, add $300 to premium
```

#### File: `src/main/java/org/hartford/miniproject/service/RiskCategoryRuleStrategy.java`
```
IMPLEMENTS: PremiumRuleStrategy
PURPOSE: Calculate premium based on vehicle risk category

FIELDS:
- condition: String (risk category: LOW, MEDIUM, HIGH)
- value: Double (addition/discount amount)

METHOD: evaluate(usage)
LOGIC:
1. Get vehicle risk category from usage data
2. Compare with condition category
3. Return true if matches, false otherwise
4. Example: If category is HIGH, add $1000 to premium
```

#### File: `src/main/java/org/hartford/miniproject/entity/PremiumCalculation.java`
```
DATABASE TABLE: PREMIUM_CALCULATIONS
FIELDS:
- calculation_id: BIGINT (PK, auto-increment)
- subscription_id: BIGINT (FK)
- usage_id: BIGINT (FK)
- base_premium: DOUBLE
- total_additions: DOUBLE
- total_discounts: DOUBLE
- final_premium: DOUBLE
- created_at: TIMESTAMP

RELATIONSHIPS:
- Many-to-One with PolicySubscription
- Many-to-One with UsageData
```

#### File: `src/main/java/org/hartford/miniproject/entity/PremiumRule.java`
```
DATABASE TABLE: PREMIUM_RULES
FIELDS:
- rule_id: BIGINT (PK)
- rule_name: VARCHAR(255) (e.g., "High Distance Rule")
- rule_type: VARCHAR(50) (DISTANCE, NIGHT_DRIVING, RISK_CATEGORY)
- condition: VARCHAR(255) (threshold condition)
- value: DOUBLE (amount to add/subtract)
- rule_category: VARCHAR(50) (ADDITION or DISCOUNT)
- is_active: BOOLEAN (if rule applies)
- created_at: TIMESTAMP

EXAMPLE RECORDS:
1. Distance_Rule: type=DISTANCE, condition=1000, value=500, category=ADDITION
2. Night_Rule: type=NIGHT_DRIVING, condition=50, value=300, category=ADDITION
3. Risk_Rule: type=RISK_CATEGORY, condition=HIGH, value=1000, category=ADDITION
```

#### File: `src/main/java/org/hartford/miniproject/repository/PremiumRuleRepository.java`
```
INTERFACE: JpaRepository<PremiumRule, Long>
CUSTOM METHODS:
- findByIsActive(boolean active) - Get all active rules
- findByRuleType(String type) - Get rules by type
```

---

## Database Schema

### Complete Database Structure

#### File: `application.properties`
```
DATABASE CONFIGURATION:
spring.datasource.url=jdbc:h2:file:./data/insurance_db
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=(empty)

DATABASE FILE:
Location: ./data/insurance_db.mv.db
Type: H2 File-based Database
DDL Mode: update (auto-create tables)

PERSISTENCE:
- Data survives application restarts
- File-based storage in ./data/ directory
```

#### Database Tables

**TABLE: ROLES**
```sql
CREATE TABLE roles (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(255) NOT NULL UNIQUE
);

RECORDS:
- (1, 'ADMIN')
- (2, 'CUSTOMER')
- (3, 'CLAIMS_OFFICER')

CREATED BY: DataInitializer.java (Order 1)
```

**TABLE: USERS**
```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(255),
    role_id BIGINT NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

RECORDS CREATED AT STARTUP:
1. Admin: (1, 'Bhavana Admin', 'bhavana@gmail.com', $2a$10$..., '8753827182', 1, 'ACTIVE', ...)
2. Claims Officer: (2, 'Claims Officer Mike', 'claims@insurance.com', $2a$10$..., '9876543214', 3, 'ACTIVE', ...)
3. Customer: (3, 'John Customer', 'customer@example.com', $2a$10$..., '9876543210', 2, 'ACTIVE', ...)

CREATED BY: AdminUserConfig.java (Order 2), TestUserConfig.java (Order 3)
```

**TABLE: POLICIES**
```sql
CREATE TABLE policies (
    policy_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    policy_name VARCHAR(255) NOT NULL,
    coverage_type VARCHAR(255),
    base_premium DOUBLE,
    description VARCHAR(255),
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**TABLE: PREMIUM_RULES**
```sql
CREATE TABLE premium_rules (
    rule_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(255),
    rule_type VARCHAR(50),
    condition VARCHAR(255),
    value DOUBLE,
    rule_category VARCHAR(50),
    is_active BOOLEAN,
    created_at TIMESTAMP
);
```

**TABLE: USAGE_DATA**
```sql
CREATE TABLE usage_data (
    usage_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    total_distance DOUBLE,
    night_driving_hours DOUBLE,
    vehicle_risk_category VARCHAR(50),
    created_at TIMESTAMP
);
```

**TABLE: PREMIUM_CALCULATIONS**
```sql
CREATE TABLE premium_calculations (
    calculation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subscription_id BIGINT NOT NULL,
    usage_id BIGINT NOT NULL,
    base_premium DOUBLE,
    total_additions DOUBLE,
    total_discounts DOUBLE,
    final_premium DOUBLE,
    created_at TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES policy_subscriptions(subscription_id),
    FOREIGN KEY (usage_id) REFERENCES usage_data(usage_id)
);
```

---

## File Structure & Implementation Details

### Package: `config`

#### DataInitializer.java
```
LOCATION: src/main/java/org/hartford/miniproject/config/DataInitializer.java
TYPE: CommandLineRunner Component
ORDER: 1 (First to run)
PURPOSE: Initialize database with roles

LOGIC:
1. Checks if roles table is empty
2. If empty, creates 3 roles:
   - ADMIN (role_id = 1)
   - CUSTOMER (role_id = 2)
   - CLAIMS_OFFICER (role_id = 3)
3. Saves to database

ANNOTATION: @Component, @Order(1)
DEPENDENCY: RoleRepository
```

#### AdminUserConfig.java
```
LOCATION: src/main/java/org/hartford/miniproject/config/AdminUserConfig.java
TYPE: CommandLineRunner Component
ORDER: 2 (Second to run)
PURPOSE: Create ADMIN user at startup

LOGIC:
1. Check if admin user exists
2. If not, fetch ADMIN role
3. Create User with:
   - Email: bhavana@gmail.com
   - Password: Bhavana@12 (encoded)
   - Full Name: Bhavana Admin
   - Phone: 8753827182
   - Role: ADMIN
   - Status: ACTIVE
4. Save to database

ANNOTATION: @Component, @Order(2)
DEPENDENCIES: UserRepository, RoleRepository, PasswordEncoder
```

#### TestUserConfig.java
```
LOCATION: src/main/java/org/hartford/miniproject/config/TestUserConfig.java
TYPE: CommandLineRunner Component
ORDER: 3 (Third to run)
PURPOSE: Create test users for development/testing

LOGIC:
1. Create Claims Officer:
   - Email: claims@insurance.com
   - Password: Mike@12345
   - Role: CLAIMS_OFFICER

2. Create Customer:
   - Email: customer@example.com
   - Password: Customer@123
   - Role: CUSTOMER

3. Both users saved to database

ANNOTATION: @Component, @Order(3)
DEPENDENCIES: UserRepository, RoleRepository, PasswordEncoder
```

#### SecurityConfig.java
```
LOCATION: src/main/java/org/hartford/miniproject/config/SecurityConfig.java
TYPE: Configuration Bean
PURPOSE: Configure Spring Security

BEANS CREATED:
1. SecurityFilterChain - Configure security filters
2. AuthenticationManager - For authentication
3. PasswordEncoder - BCrypt encoding

CONFIGURATION:
- JWT filter added to filter chain
- CORS enabled for frontend
- AuthenticationManager registered
- Password encoder configured
```

### Package: `controller`

#### AuthController.java
```
LOCATION: src/main/java/org/hartford/miniproject/controller/AuthController.java
TYPE: REST Controller
BASE URL: /api/auth

ENDPOINTS:
1. POST /api/auth/login
   - Input: LoginRequest (email, password)
   - Output: AuthResponse (token, email, role, userId)
   - Service: AuthService.login()

2. POST /api/auth/register
   - Input: RegisterRequest
   - Output: AuthResponse
   - Service: AuthService.register()

ANNOTATIONS: @RestController, @RequestMapping("/api/auth")
DEPENDENCIES: AuthService
```

#### PasswordRecoveryController.java
```
LOCATION: src/main/java/org/hartford/miniproject/controller/PasswordRecoveryController.java
TYPE: REST Controller
BASE URL: /api/auth/password

ENDPOINTS:
1. POST /api/auth/password/forgot?email=...
   - Input: Email query parameter
   - Output: Reset token
   - Service: PasswordRecoveryService.generateResetToken()

2. POST /api/auth/password/reset
   - Input: PasswordResetRequest DTO
   - Output: Success message
   - Service: PasswordRecoveryService.resetPassword()

3. POST /api/auth/password/change
   - Input: PasswordChangeRequest DTO
   - Output: Success message
   - Service: PasswordRecoveryService.changePassword()

ANNOTATIONS: @RestController, @RequestMapping("/api/auth/password")
DEPENDENCIES: PasswordRecoveryService
```

#### PremiumController.java
```
LOCATION: src/main/java/org/hartford/miniproject/controller/PremiumController.java
TYPE: REST Controller
BASE URL: /api/premium

ENDPOINTS:
1. POST /api/premium/calculate/{policyId}?usageId=...
   - Input: policyId, usageId
   - Output: PremiumCalculation
   - Service: PremiumService.calculatePremium()

2. GET /api/premium/history/{subscriptionId}
   - Input: subscriptionId
   - Output: List of PremiumCalculation
   - Service: PremiumService.getPremiumHistory()

ANNOTATIONS: @RestController, @RequestMapping("/api/premium")
DEPENDENCIES: PremiumService
```

### Package: `service`

#### AuthService.java
```
LOCATION: src/main/java/org/hartford/miniproject/service/AuthService.java
TYPE: Service (Business Logic)

METHODS:
1. register(RegisterRequest)
   - Check if email exists
   - Get role from role repository
   - Create user with encoded password
   - Generate JWT token
   - Return AuthResponse

2. login(LoginRequest)
   - Authenticate credentials with AuthenticationManager
   - Get user from repository
   - Generate JWT token
   - Return AuthResponse

DEPENDENCIES:
- UserRepository
- RoleRepository
- PasswordEncoder
- JwtUtil
- AuthenticationManager
```

#### PasswordRecoveryService.java
```
LOCATION: src/main/java/org/hartford/miniproject/service/PasswordRecoveryService.java
TYPE: Service (Business Logic)

METHODS:
1. generateResetToken(email)
   - Find user by email
   - Generate UUID token
   - Return token

2. resetPassword(email, newPassword)
   - Find user by email
   - Validate password (8+ chars)
   - Encode password
   - Update user in database

3. changePassword(email, oldPassword, newPassword)
   - Find user by email
   - Verify old password with PasswordEncoder.matches()
   - Validate new password
   - Encode and update password

DEPENDENCIES:
- UserRepository
- PasswordEncoder

EXCEPTIONS:
- ResourceNotFoundException (user not found)
- IllegalArgumentException (invalid password)
```

#### PremiumService.java
```
LOCATION: src/main/java/org/hartford/miniproject/service/PremiumService.java
TYPE: Service (Business Logic)

METHODS:
1. calculatePremium(subscriptionId, usageId)
   - Fetch PolicySubscription
   - Fetch UsageData
   - Call PremiumRuleEngine.calculatePremium()
   - Create PremiumCalculation entity
   - Save to database
   - Return entity

2. getPremiumHistory(subscriptionId)
   - Query all calculations for subscription
   - Return list

DEPENDENCIES:
- PolicySubscriptionRepository
- UsageDataRepository
- PremiumCalculationRepository
- PremiumRuleEngine
```

#### PremiumRuleEngine.java
```
LOCATION: src/main/java/org/hartford/miniproject/service/PremiumRuleEngine.java
TYPE: Service (Business Logic)
SEE ATTACHED FILE FOR COMPLETE CODE

METHODS:
1. calculatePremium(usage, basePremium)
   - Fetch all active premium rules
   - For each rule:
     * Create appropriate strategy
     * Evaluate if applies to usage
     * Add to additions or subtract from discounts
   - Calculate final premium
   - Return map with breakdown

2. createStrategy(rule)
   - Create DistanceRuleStrategy if DISTANCE
   - Create NightDrivingRuleStrategy if NIGHT_DRIVING
   - Create RiskCategoryRuleStrategy if RISK_CATEGORY
   - Return null if unknown type

DEPENDENCIES:
- PremiumRuleRepository
- DistanceRuleStrategy
- NightDrivingRuleStrategy
- RiskCategoryRuleStrategy
```

#### Strategy Classes

**DistanceRuleStrategy.java**
```
LOCATION: src/main/java/org/hartford/miniproject/service/DistanceRuleStrategy.java
TYPE: Strategy (Rule Evaluation)
IMPLEMENTS: PremiumRuleStrategy

FIELDS:
- condition: String (distance threshold)
- value: Double (amount)

METHODS:
1. evaluate(usage) - Check if distance exceeds condition
2. getValue() - Return value
3. getRuleType() - Return "ADDITION" or "DISCOUNT"

USAGE: Calculate premium additions/discounts based on distance
```

**NightDrivingRuleStrategy.java**
```
LOCATION: src/main/java/org/hartford/miniproject/service/NightDrivingRuleStrategy.java
TYPE: Strategy (Rule Evaluation)
IMPLEMENTS: PremiumRuleStrategy

FIELDS:
- condition: String (night hours threshold)
- value: Double (amount)

METHODS:
1. evaluate(usage) - Check if night hours exceed condition
2. getValue() - Return value
3. getRuleType() - Return "ADDITION" or "DISCOUNT"

USAGE: Calculate premium additions/discounts based on night driving
```

**RiskCategoryRuleStrategy.java**
```
LOCATION: src/main/java/org/hartford/miniproject/service/RiskCategoryRuleStrategy.java
TYPE: Strategy (Rule Evaluation)
IMPLEMENTS: PremiumRuleStrategy

FIELDS:
- condition: String (risk category)
- value: Double (amount)

METHODS:
1. evaluate(usage) - Check if risk category matches
2. getValue() - Return value
3. getRuleType() - Return "ADDITION" or "DISCOUNT"

USAGE: Calculate premium additions/discounts based on risk category
```

### Package: `dto` (Data Transfer Objects)

#### LoginRequest.java
```
PURPOSE: Input DTO for login
FIELDS:
- email: String
- password: String

VALIDATION:
- @NotBlank on both fields
```

#### AuthResponse.java
```
PURPOSE: Output DTO for login
FIELDS:
- token: String (JWT token)
- email: String (user email)
- role: String (user role)
- userId: Long (user ID)
```

#### PasswordResetRequest.java
```
PURPOSE: Input DTO for password reset
FIELDS:
- email: String
- newPassword: String
- confirmPassword: String

VALIDATION:
- @NotBlank on all
- @Size(min=8) on passwords
- @Email on email
```

#### PasswordChangeRequest.java
```
PURPOSE: Input DTO for password change (logged in)
FIELDS:
- email: String
- oldPassword: String
- newPassword: String
- confirmPassword: String

VALIDATION:
- @NotBlank on all
- @Size(min=8) on new passwords
- @Email on email
```

### Package: `entity`

#### User.java
```
TABLE: USERS
FIELDS: user_id, email, password, full_name, phone, role_id, status, created_at, updated_at
RELATIONSHIPS: ManyToOne with Role
```

#### Role.java
```
TABLE: ROLES
FIELDS: role_id, role_name
RELATIONSHIPS: OneToMany with User
```

#### PremiumRule.java
```
TABLE: PREMIUM_RULES
FIELDS: rule_id, rule_name, rule_type, condition, value, rule_category, is_active, created_at
```

#### PremiumCalculation.java
```
TABLE: PREMIUM_CALCULATIONS
FIELDS: calculation_id, subscription_id, usage_id, base_premium, total_additions, total_discounts, final_premium, created_at
RELATIONSHIPS: ManyToOne with PolicySubscription and UsageData
```

#### UsageData.java
```
TABLE: USAGE_DATA
FIELDS: usage_id, total_distance, night_driving_hours, vehicle_risk_category, created_at
```

### Package: `repository`

#### UserRepository.java
```
INTERFACE: JpaRepository<User, Long>
CUSTOM METHODS:
- findByEmail(String email) - Find user by email
- existsByEmail(String email) - Check if email exists
```

#### RoleRepository.java
```
INTERFACE: JpaRepository<Role, Long>
CUSTOM METHODS:
- findByRoleName(String roleName) - Find role by name
```

#### PremiumRuleRepository.java
```
INTERFACE: JpaRepository<PremiumRule, Long>
CUSTOM METHODS:
- findByIsActive(boolean active) - Get all active rules
- findByRuleType(String type) - Get rules by type
```

#### PremiumCalculationRepository.java
```
INTERFACE: JpaRepository<PremiumCalculation, Long>
CUSTOM METHODS:
- findBySubscription_SubscriptionId(Long subId) - Get premium history
```

### Package: `security`

#### JwtUtil.java
```
PURPOSE: JWT token generation and validation
METHODS:
1. generateToken(email, role) - Create JWT token
2. validateToken(token) - Validate JWT token
3. getEmailFromToken(token) - Extract email from token
4. getRoleFromToken(token) - Extract role from token

CONFIGURATION:
- Secret: 5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
- Expiration: 86400000 ms (24 hours)
- Algorithm: HS256
```

#### JwtAuthenticationFilter.java
```
PURPOSE: Filter JWT token from all HTTP requests
EXTENDS: OncePerRequestFilter
LOGIC:
1. Extract Authorization header
2. Extract token (format: Bearer {token})
3. Validate token with JwtUtil
4. Extract email from token
5. Load user details via CustomUserDetailsService
6. Set SecurityContext with authentication
7. Continue filter chain

RUNS: For every HTTP request to protected endpoints
```

#### CustomUserDetailsService.java
```
PURPOSE: Load user details for Spring Security
IMPLEMENTS: UserDetailsService

METHOD: loadUserByUsername(email)
STEPS:
1. Find user by email
2. Create UserDetails with:
   - Username: email
   - Password: encoded password
   - Authorities: user roles
3. Return UserDetails
4. Throw UsernameNotFoundException if not found
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Input | Output | File |
|--------|----------|-------|--------|------|
| POST | /api/auth/login | LoginRequest | AuthResponse | AuthController.java |
| POST | /api/auth/register | RegisterRequest | AuthResponse | AuthController.java |

### Password Recovery Endpoints

| Method | Endpoint | Input | Output | File |
|--------|----------|-------|--------|------|
| POST | /api/auth/password/forgot | email (query) | Token | PasswordRecoveryController.java |
| POST | /api/auth/password/reset | PasswordResetRequest | Message | PasswordRecoveryController.java |
| POST | /api/auth/password/change | PasswordChangeRequest | Message | PasswordRecoveryController.java |

### Premium Calculation Endpoints

| Method | Endpoint | Input | Output | File |
|--------|----------|-------|--------|------|
| POST | /api/premium/calculate/{policyId} | usageId (query) | PremiumCalculation | PremiumController.java |
| GET | /api/premium/history/{subscriptionId} | - | List<PremiumCalculation> | PremiumController.java |

---

## Data Flow Diagrams

### 1. Login Flow Diagram

```
USER
  │
  ▼
FRONTEND (Login Form)
  │ POST /api/auth/login
  │ {email, password}
  ▼
AuthController.login()
  │
  ▼
AuthService.login()
  │ 1. AuthenticationManager.authenticate()
  │ 2. UserRepository.findByEmail()
  │ 3. JwtUtil.generateToken()
  ▼
JwtUtil.generateToken()
  │ Creates JWT token with email, role
  │ Signs with secret key
  │ Sets expiration (24 hours)
  ▼
AuthResponse (token, email, role, userId)
  │
  ▼
FRONTEND (Store token in localStorage)
  │
  ▼
FRONTEND (Add token to header)
  │ Authorization: Bearer {token}
  ▼
Protected Endpoints
  │
  ▼
JwtAuthenticationFilter
  │ Validates token
  │ Extracts email
  │ Loads user details
  ▼
API Execution
```

### 2. Password Recovery Flow Diagram

```
USER (Forgot Password)
  │
  ▼
REQUEST RESET TOKEN
  │ POST /api/auth/password/forgot?email=...
  ▼
PasswordRecoveryController.forgotPassword()
  │
  ▼
PasswordRecoveryService.generateResetToken()
  │ 1. Find user by email
  │ 2. Generate UUID token
  ▼
Return Token to USER
  │
  ▼
USER (Receives token, enters new password)
  │
  ▼
RESET PASSWORD
  │ POST /api/auth/password/reset
  │ {email, newPassword, confirmPassword}
  ▼
PasswordRecoveryController.resetPassword()
  │ Validate passwords match
  ▼
PasswordRecoveryService.resetPassword()
  │ 1. Find user
  │ 2. Encode new password
  │ 3. Update in database
  ▼
Success Message
  │
  ▼
USER (Login with new password)
  │ POST /api/auth/login
  ▼
[Same as Login Flow Above]
```

### 3. Premium Calculation Flow Diagram

```
REQUEST: POST /api/premium/calculate/101?usageId=5
  │
  ▼
PremiumController
  │ Extract policyId=101, usageId=5
  ▼
PremiumService.calculatePremium()
  │
  ├─ STEP 1: Fetch PolicySubscription(101)
  │  └─ PolicySubscriptionRepository.findById(101)
  │     └─ Get basePremium from Policy
  │
  ├─ STEP 2: Fetch UsageData(5)
  │  └─ UsageDataRepository.findById(5)
  │     └─ Get totalDistance, nightHours, riskCategory
  │
  ├─ STEP 3: Call PremiumRuleEngine
  │  └─ PremiumRuleEngine.calculatePremium(usage, basePremium)
  │     │
  │     ├─ Get all active rules: PremiumRuleRepository.findByIsActive(true)
  │     │
  │     ├─ For each rule:
  │     │  ├─ Create Strategy (Distance/Night/Risk)
  │     │  ├─ Evaluate strategy against usage
  │     │  ├─ If true, add to totalAdditions or totalDiscounts
  │     │
  │     └─ Calculate: finalPremium = basePremium + additions - discounts
  │
  ├─ STEP 4: Create PremiumCalculation entity
  │  └─ Set all calculated values
  │
  ├─ STEP 5: Save to database
  │  └─ PremiumCalculationRepository.save()
  │
  └─ STEP 6: Return to Controller
     └─ PremiumCalculation object

RESPONSE:
{
  "calculationId": 1,
  "subscriptionId": 101,
  "usageId": 5,
  "basePremium": 5000.0,
  "totalAdditions": 1500.0,
  "totalDiscounts": 500.0,
  "finalPremium": 6000.0
}
```

### 4. Startup Initialization Flow Diagram

```
Application Start
  │
  ▼
Spring Boot Initialization
  │
  ├─ ORDER 1: DataInitializer
  │  ├─ Check if roles exist
  │  ├─ If not:
  │  │  ├─ Create ADMIN role (id=1)
  │  │  ├─ Create CUSTOMER role (id=2)
  │  │  └─ Create CLAIMS_OFFICER role (id=3)
  │  └─ Save to database
  │
  ├─ ORDER 2: AdminUserConfig
  │  ├─ Check if admin exists
  │  ├─ If not:
  │  │  ├─ Fetch ADMIN role
  │  │  ├─ Create User: bhavana@gmail.com / Bhavana@12
  │  │  └─ Encode password with BCrypt
  │  └─ Save to database
  │
  ├─ ORDER 3: TestUserConfig
  │  ├─ Create Claims Officer: claims@insurance.com / Mike@12345
  │  └─ Create Customer: customer@example.com / Customer@123
  │
  └─ Application Ready
     └─ Server listening on port 8080
```

---

## Summary Table

| Component | File | Purpose | Input | Output |
|-----------|------|---------|-------|--------|
| **Controller** | AuthController.java | Handle login requests | LoginRequest | AuthResponse |
| **Service** | AuthService.java | Authenticate users | LoginRequest | AuthResponse |
| **Security** | JwtUtil.java | Generate JWT tokens | email, role | JWT token |
| **Filter** | JwtAuthenticationFilter.java | Validate requests | Bearer token | Authenticated request |
| **Config** | AdminUserConfig.java | Create admin user | - | User in DB |
| **Config** | TestUserConfig.java | Create test users | - | Users in DB |
| **Controller** | PasswordRecoveryController.java | Handle password endpoints | Email/Passwords | Success/Token |
| **Service** | PasswordRecoveryService.java | Password reset logic | Email/Password | Success |
| **Controller** | PremiumController.java | Handle premium calculation | policyId, usageId | PremiumCalculation |
| **Service** | PremiumService.java | Calculate premium | subscription, usage | Calculation result |
| **Engine** | PremiumRuleEngine.java | Apply rules to premium | Usage, basePremium | Final premium |
| **Strategy** | DistanceRuleStrategy.java | Evaluate distance | UsageData | true/false |
| **Strategy** | NightDrivingRuleStrategy.java | Evaluate night hours | UsageData | true/false |
| **Strategy** | RiskCategoryRuleStrategy.java | Evaluate risk | UsageData | true/false |

---

## Conclusion

This document provides a complete overview of:
1. ✅ Authentication & Login Flow
2. ✅ Password Recovery System
3. ✅ Premium Calculation Engine
4. ✅ Database Schema
5. ✅ All File Locations & Purposes
6. ✅ API Endpoints
7. ✅ Data Flow Diagrams

**Total Files Involved:** 20+ Java files + Configuration files
**Total Lines of Code:** ~2,000+ lines
**Documentation:** Complete for all flows

**Status:** Ready for Production Review ✅


