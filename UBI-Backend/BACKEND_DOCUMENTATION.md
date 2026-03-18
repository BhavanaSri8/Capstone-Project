# Usage-Based Insurance (UBI) Backend - Complete Documentation

## 📁 Backend Architecture Overview

```
src/main/java/org/hartford/miniproject/
├── config/              # Configuration classes
├── controller/          # REST API endpoints
├── dto/                 # Data Transfer Objects
├── entity/              # JPA entities (database tables)
├── exception/           # Exception handling
├── repository/          # Database access layer
├── security/            # JWT authentication & security
├── service/             # Business logic layer
└── MiniProjectApplication.java  # Main Spring Boot application
```

---

## 🏗️ Architecture Pattern: Layered Architecture

```
Client (Frontend)
    ↓
Controller Layer (REST APIs)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (MySQL)
```

---

## 📦 Technology Stack

- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Security**: Spring Security + JWT
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA (Hibernate)
- **Build Tool**: Maven
- **API Documentation**: Swagger/OpenAPI
- **Utilities**: Lombok

---

## 🔐 Security Layer

### **security/JwtUtil.java**
**Purpose**: JWT token generation and validation
**What it does**:
- Generates JWT tokens with email and role
- Extracts email and role from token
- Validates token expiration
- Uses HMAC-SHA256 signing

**Key Methods**:
```java
generateToken(email, role)  // Creates JWT token
extractEmail(token)         // Gets email from token
extractRole(token)          // Gets role from token
validateToken(token, user)  // Checks if token is valid
```

**Configuration**:
- Secret key from application.properties
- Expiration time configurable

---

### **security/JwtAuthenticationFilter.java**
**Purpose**: Intercepts HTTP requests to validate JWT
**What it does**:
- Extracts JWT from Authorization header
- Validates token
- Sets authentication in SecurityContext
- Allows /api/auth/* endpoints without token

**Flow**:
```
1. Request comes in
2. Check if path is /api/auth/* (skip if yes)
3. Extract token from "Bearer <token>"
4. Validate token
5. Load user details
6. Set authentication
7. Continue request
```

---

### **security/CustomUserDetailsService.java**
**Purpose**: Loads user details for authentication
**What it does**:
- Implements UserDetailsService
- Loads user by email from database
- Returns UserDetails with authorities

---

## 🎛️ Configuration Layer

### **config/SecurityConfig.java**
**Purpose**: Configure Spring Security
**What it does**:
- Disables CSRF (for REST API)
- Configures CORS (allows frontend)
- Sets up JWT filter
- Permits /api/auth/* endpoints
- Requires authentication for other endpoints

**Security Rules**:
```java
/api/auth/**        → Permit all
/swagger-ui/**      → Permit all
/v3/api-docs/**     → Permit all
All other endpoints → Require authentication
```

---

### **config/DataInitializer.java**
**Purpose**: Initialize default data on startup
**What it does**:
- Creates 4 default roles (ADMIN, AGENT, CUSTOMER, CLAIMS_OFFICER)
- Runs on application startup
- Uses @PostConstruct annotation

---

### **config/OpenAPIConfig.java**
**Purpose**: Configure Swagger/OpenAPI documentation
**What it does**:
- Sets up API documentation
- Configures JWT security scheme
- Accessible at /swagger-ui.html

---

## 🎮 Controller Layer (REST APIs)

### **controller/AuthController.java**
**Purpose**: Authentication endpoints
**Endpoints**:
```
POST /api/auth/register  → Register new user
POST /api/auth/login     → Login user
```

**Register Flow**:
1. Validate input
2. Check if email exists
3. Encode password (BCrypt)
4. Save user to database
5. Return success message

**Login Flow**:
1. Validate credentials
2. Authenticate user
3. Generate JWT token
4. Return token + user details

**Response**:
```json
{
  "token": "eyJhbGc...",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "userId": 1,
  "fullName": "John Doe"
}
```

---

### **controller/PolicyController.java**
**Purpose**: Policy management
**Endpoints**:
```
POST   /api/policies              → Create policy (Admin)
GET    /api/policies              → Get all policies (paginated)
GET    /api/policies/{id}         → Get policy by ID
PUT    /api/policies/{id}/status  → Activate/Deactivate policy
```

**Access Control**:
- Create: ADMIN only
- View: All authenticated users

---

### **controller/PolicyOrderController.java**
**Purpose**: Policy order management
**Endpoints**:
```
POST /api/policy-orders                → Create order
GET  /api/policy-orders                → Get all orders
GET  /api/policy-orders/user/{userId}  → Get orders by user
PUT  /api/policy-orders/{id}/approve   → Approve order (Agent/Admin)
PUT  /api/policy-orders/{id}/reject    → Reject order (Agent/Admin)
```

**Order Flow**:
1. Customer creates order
2. Agent/Admin approves
3. Subscription is created automatically
4. Order status changes to APPROVED

---

### **controller/VehicleController.java**
**Purpose**: Vehicle management
**Endpoints**:
```
POST   /api/vehicles       → Register vehicle
GET    /api/vehicles       → Get all vehicles (paginated)
GET    /api/vehicles/{id}  → Get vehicle by ID
PUT    /api/vehicles/{id}  → Update vehicle
DELETE /api/vehicles/{id}  → Delete vehicle
```

**Vehicle Data**:
- Vehicle number (unique)
- Type (CAR, BIKE, SUV, etc.)
- Age
- Owner (User)

---

### **controller/UsageController.java**
**Purpose**: Track vehicle usage
**Endpoints**:
```
POST /api/usage                              → Add monthly usage
GET  /api/usage/subscription/{id}            → Get usage by subscription
GET  /api/usage/subscription/{id}/month      → Get usage by month
```

**Usage Data**:
- Total distance (km)
- Night driving hours
- Trip count
- Risk category (LOW, MEDIUM, HIGH)
- Billing month/year

---

### **controller/PremiumController.java**
**Purpose**: Premium calculation
**Endpoints**:
```
POST /api/premium/calculate/{subscriptionId}  → Calculate premium
GET  /api/premium/history/{subscriptionId}    → Get premium history
```

**Calculation Flow**:
1. Get subscription and usage data
2. Apply premium rules (Strategy Pattern)
3. Calculate total premium
4. Save calculation
5. Return result

---

### **controller/ClaimController.java**
**Purpose**: Claims management
**Endpoints**:
```
POST /api/claims                          → Raise claim
GET  /api/claims/subscription/{id}        → Get claims by subscription
GET  /api/claims                          → Get all claims
PUT  /api/claims/{id}/approve             → Approve claim (Claims Officer)
PUT  /api/claims/{id}/reject              → Reject claim (Claims Officer)
```

**Claim Statuses**:
- PENDING
- APPROVED
- REJECTED

---

### **controller/RuleController.java**
**Purpose**: Premium rule management
**Endpoints**:
```
POST   /api/rules              → Create rule (Admin)
GET    /api/rules              → Get all rules
PUT    /api/rules/{id}         → Update rule (Admin)
DELETE /api/rules/{id}         → Delete rule (Admin)
PUT    /api/rules/{id}/activate   → Activate rule
PUT    /api/rules/{id}/deactivate → Deactivate rule
```

**Rule Types**:
1. DISTANCE - Based on km driven
2. NIGHT_DRIVING - Based on night hours
3. RISK_CATEGORY - Based on risk level

---

### **controller/DashboardController.java**
**Purpose**: Dashboard statistics
**Endpoints**:
```
GET /api/dashboard/summary              → Dashboard summary
GET /api/dashboard/risk-distribution    → Risk distribution
GET /api/dashboard/monthly-revenue      → Monthly revenue
GET /api/dashboard/active-subscriptions → Active subscriptions count
```

**Summary Response**:
```json
{
  "activeSubscriptions": 15,
  "totalClaims": 8,
  "pendingClaims": 3,
  "totalRevenue": 52500
}
```

---

### **controller/UserManagementController.java**
**Purpose**: User management (Admin)
**Endpoints**:
```
GET /api/admin/users              → Get all users (paginated)
GET /api/admin/users/{id}         → Get user by ID
PUT /api/admin/users/{id}/role    → Update user role
PUT /api/admin/users/{id}/deactivate → Deactivate user
```

**Access Control**: ADMIN only

---

## 💼 Service Layer (Business Logic)

### **service/AuthService.java**
**Purpose**: Authentication business logic
**Methods**:
```java
register(RegisterRequest)  // Register new user
login(LoginRequest)        // Authenticate and generate token
```

**Responsibilities**:
- Password encoding (BCrypt)
- User validation
- Token generation
- Role assignment

---

### **service/PolicyService.java**
**Purpose**: Policy business logic
**Methods**:
```java
createPolicy(PolicyRequest)     // Create new policy
getAllPolicies(Pageable)        // Get paginated policies
getPolicyById(Long)             // Get single policy
updatePolicyStatus(Long, boolean) // Activate/Deactivate
```

---

### **service/PolicyOrderService.java**
**Purpose**: Order processing logic
**Methods**:
```java
createOrder(userId, policyId)  // Create order
approveOrder(orderId)          // Approve and create subscription
rejectOrder(orderId)           // Reject order
```

**Approve Order Logic**:
1. Validate order exists
2. Check if already processed
3. Create subscription
4. Update order status
5. Return subscription

---

### **service/VehicleService.java**
**Purpose**: Vehicle management logic
**Methods**:
```java
registerVehicle(VehicleRequest)  // Register new vehicle
getAllVehicles(Pageable)         // Get paginated vehicles
updateVehicle(Long, VehicleRequest) // Update vehicle
deleteVehicle(Long)              // Delete vehicle
```

---

### **service/UsageService.java**
**Purpose**: Usage tracking logic
**Methods**:
```java
addUsage(UsageRequest)           // Add monthly usage
getUsageBySubscription(Long)     // Get all usage
getUsageByMonth(Long, int, int)  // Get specific month
```

---

### **service/PremiumService.java**
**Purpose**: Premium calculation orchestration
**Methods**:
```java
calculatePremium(subscriptionId, usageId)  // Calculate premium
getPremiumHistory(subscriptionId)          // Get history
```

**Calculation Steps**:
1. Get base premium from policy
2. Get usage data
3. Apply all active rules
4. Sum up adjustments
5. Save calculation
6. Return result

---

### **service/PremiumRuleEngine.java**
**Purpose**: Rule engine using Strategy Pattern
**Methods**:
```java
applyRules(basePremium, usageData, rules)  // Apply all rules
```

**Strategy Pattern**:
- Interface: PremiumRuleStrategy
- Implementations:
  - DistanceRuleStrategy
  - NightDrivingRuleStrategy
  - RiskCategoryRuleStrategy

**How it works**:
```java
for each rule:
  1. Select strategy based on rule type
  2. Check if condition matches
  3. Apply adjustment (add/subtract)
  4. Continue to next rule
```

---

### **service/DistanceRuleStrategy.java**
**Purpose**: Distance-based premium calculation
**Logic**:
```java
if (distance > threshold):
  premium += surcharge
else if (distance < threshold):
  premium -= discount
```

**Example Rule**:
- Condition: "> 10000"
- Value: 1000
- Result: Add ₹1000 if distance > 10000 km

---

### **service/NightDrivingRuleStrategy.java**
**Purpose**: Night driving premium calculation
**Logic**:
```java
if (nightHours > threshold):
  premium += surcharge
```

**Example Rule**:
- Condition: "> 20"
- Value: 500
- Result: Add ₹500 if night hours > 20

---

### **service/RiskCategoryRuleStrategy.java**
**Purpose**: Risk-based premium calculation
**Logic**:
```java
if (riskCategory == HIGH):
  premium += highRiskSurcharge
else if (riskCategory == LOW):
  premium -= lowRiskDiscount
```

**Example Rule**:
- Condition: "HIGH"
- Value: 2000
- Result: Add ₹2000 for HIGH risk

---

### **service/ClaimService.java**
**Purpose**: Claims processing logic
**Methods**:
```java
raiseClaim(ClaimRequest)     // Create new claim
approveClaim(Long)           // Approve claim
rejectClaim(Long)            // Reject claim
getAllClaims()               // Get all claims
```

---

### **service/DashboardService.java**
**Purpose**: Dashboard statistics calculation
**Methods**:
```java
getDashboardSummary()        // Get summary stats
getRiskDistribution()        // Get risk breakdown
getMonthlyRevenue()          // Calculate revenue
getActiveSubscriptions()     // Count active subs
```

---

## 🗄️ Repository Layer (Data Access)

### **repository/UserRepository.java**
**Purpose**: User database operations
**Methods**:
```java
findByEmail(String)          // Find user by email
existsByEmail(String)        // Check if email exists
```

**Extends**: JpaRepository<User, Long>

---

### **repository/PolicyRepository.java**
**Purpose**: Policy database operations
**Methods**:
```java
findByIsActive(boolean)      // Find active policies
```

---

### **repository/PolicyOrderRepository.java**
**Purpose**: Order database operations
**Methods**:
```java
findByUser(User)             // Find orders by user
findByOrderStatus(String)    // Find by status
```

---

### **repository/VehicleRepository.java**
**Purpose**: Vehicle database operations
**Methods**:
```java
findByVehicleNumber(String)  // Find by number
findByOwner(User)            // Find by owner
```

---

### **repository/UsageDataRepository.java**
**Purpose**: Usage data operations
**Methods**:
```java
findBySubscription(PolicySubscription)  // Find by subscription
findByBillingMonthAndYear(int, int)     // Find by month
```

---

### **repository/PremiumRuleRepository.java**
**Purpose**: Rule database operations
**Methods**:
```java
findByIsActive(boolean)      // Find active rules
findByRuleType(String)       // Find by type
```

---

### **repository/ClaimRepository.java**
**Purpose**: Claim database operations
**Methods**:
```java
findBySubscription(PolicySubscription)  // Find by subscription
findByClaimStatus(String)               // Find by status
```

---

## 📊 Entity Layer (Database Tables)

### **entity/User.java**
**Table**: users
**Fields**:
- userId (PK, Auto)
- fullName
- email (Unique)
- password (Encrypted)
- phone
- status (ACTIVE/INACTIVE)
- role (ManyToOne → Role)

**Relationships**:
- One User → Many Vehicles
- One User → Many PolicyOrders

---

### **entity/Role.java**
**Table**: roles
**Fields**:
- roleId (PK, Auto)
- roleName (ADMIN, AGENT, CUSTOMER, CLAIMS_OFFICER)

**Relationships**:
- One Role → Many Users

---

### **entity/Policy.java**
**Table**: policies
**Fields**:
- policyId (PK, Auto)
- policyName
- coverageType
- basePremium
- description
- isActive

**Relationships**:
- One Policy → Many PolicyOrders
- One Policy → Many PolicySubscriptions

---

### **entity/PolicyOrder.java**
**Table**: policy_orders
**Fields**:
- orderId (PK, Auto)
- orderDate
- orderStatus (PENDING, APPROVED, REJECTED)
- user (ManyToOne → User)
- policy (ManyToOne → Policy)

**Relationships**:
- Many Orders → One User
- Many Orders → One Policy

---

### **entity/PolicySubscription.java**
**Table**: policy_subscriptions
**Fields**:
- subscriptionId (PK, Auto)
- startDate
- endDate
- subscriptionStatus (ACTIVE, EXPIRED, CANCELLED)
- user (ManyToOne → User)
- policy (ManyToOne → Policy)

**Relationships**:
- Many Subscriptions → One User
- Many Subscriptions → One Policy
- One Subscription → Many UsageData
- One Subscription → Many Claims

---

### **entity/Vehicle.java**
**Table**: vehicles
**Fields**:
- vehicleId (PK, Auto)
- vehicleNumber (Unique)
- vehicleType (CAR, BIKE, SUV, TRUCK)
- vehicleAge
- status (ACTIVE, INACTIVE)
- owner (ManyToOne → User)

**Relationships**:
- Many Vehicles → One User

---

### **entity/VehicleSubscription.java**
**Table**: vehicle_subscriptions
**Fields**:
- id (PK, Auto)
- vehicle (ManyToOne → Vehicle)
- subscription (ManyToOne → PolicySubscription)

**Purpose**: Links vehicles to subscriptions (Many-to-Many)

---

### **entity/UsageData.java**
**Table**: usage_data
**Fields**:
- usageId (PK, Auto)
- billingMonth
- billingYear
- totalDistanceKm
- nightDrivingHours
- tripCount
- riskCategory (LOW, MEDIUM, HIGH)
- subscription (ManyToOne → PolicySubscription)

**Relationships**:
- Many UsageData → One Subscription

---

### **entity/PremiumRule.java**
**Table**: premium_rules
**Fields**:
- ruleId (PK, Auto)
- ruleName
- ruleType (DISTANCE, NIGHT_DRIVING, RISK_CATEGORY)
- condition (e.g., "> 10000", "HIGH")
- value (adjustment amount)
- isActive

**Purpose**: Define rules for premium calculation

---

### **entity/PremiumCalculation.java**
**Table**: premium_calculations
**Fields**:
- calculationId (PK, Auto)
- basePremium
- totalPremium
- calculationDate
- subscription (ManyToOne → PolicySubscription)
- usageData (ManyToOne → UsageData)

**Purpose**: Store premium calculation history

---

### **entity/Claim.java**
**Table**: claims
**Fields**:
- claimId (PK, Auto)
- claimAmount
- claimReason
- claimDate
- claimStatus (PENDING, APPROVED, REJECTED)
- subscription (ManyToOne → PolicySubscription)

**Relationships**:
- Many Claims → One Subscription

---

## 📝 DTO Layer (Data Transfer Objects)

### **dto/RegisterRequest.java**
**Purpose**: User registration input
**Fields**:
- fullName
- email
- password
- phone
- roleId

---

### **dto/LoginRequest.java**
**Purpose**: Login input
**Fields**:
- email
- password

---

### **dto/AuthResponse.java**
**Purpose**: Authentication response
**Fields**:
- token
- email
- role
- userId
- fullName

---

### **dto/PolicyRequest.java**
**Purpose**: Policy creation input
**Fields**:
- policyName
- coverageType
- basePremium
- description

---

### **dto/VehicleRequest.java**
**Purpose**: Vehicle registration input
**Fields**:
- vehicleNumber
- vehicleType
- vehicleAge
- ownerId

---

### **dto/UsageRequest.java**
**Purpose**: Usage data input
**Fields**:
- subscriptionId
- billingMonth
- billingYear
- totalDistanceKm
- nightDrivingHours
- tripCount
- riskCategory

---

### **dto/ClaimRequest.java**
**Purpose**: Claim submission input
**Fields**:
- subscriptionId
- claimAmount
- claimReason

---

## ⚠️ Exception Handling

### **exception/GlobalExceptionHandler.java**
**Purpose**: Centralized exception handling
**Handles**:
- ResourceNotFoundException → 404
- BadRequestException → 400
- General Exception → 500

**Response Format**:
```json
{
  "timestamp": "2025-03-01T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found",
  "path": "/api/users/999"
}
```

---

### **exception/ResourceNotFoundException.java**
**Purpose**: Custom exception for missing resources
**Usage**: Thrown when entity not found in database

---

### **exception/BadRequestException.java**
**Purpose**: Custom exception for invalid input
**Usage**: Thrown for validation errors

---

## 🔄 Application Flow Examples

### **User Registration Flow**:
```
1. POST /api/auth/register
2. AuthController receives request
3. AuthService validates input
4. Check if email exists (UserRepository)
5. Encode password (BCrypt)
6. Save user (UserRepository)
7. Return success response
```

### **Login Flow**:
```
1. POST /api/auth/login
2. AuthController receives credentials
3. AuthService authenticates
4. CustomUserDetailsService loads user
5. JwtUtil generates token
6. Return token + user details
```

### **Create Policy Order Flow**:
```
1. POST /api/policy-orders?userId=1&policyId=1
2. PolicyOrderController receives request
3. PolicyOrderService validates user and policy
4. Create order with PENDING status
5. Save order (PolicyOrderRepository)
6. Return order details
```

### **Approve Order Flow**:
```
1. PUT /api/policy-orders/1/approve
2. PolicyOrderController receives request
3. PolicyOrderService gets order
4. Create PolicySubscription
5. Update order status to APPROVED
6. Save subscription and order
7. Return subscription details
```

### **Calculate Premium Flow**:
```
1. POST /api/premium/calculate/1?usageId=1
2. PremiumController receives request
3. PremiumService gets subscription and usage
4. Get base premium from policy
5. PremiumRuleEngine applies all active rules
6. Each strategy calculates adjustment
7. Sum total premium
8. Save PremiumCalculation
9. Return calculation result
```

### **Raise Claim Flow**:
```
1. POST /api/claims
2. ClaimController receives request
3. ClaimService validates subscription
4. Create claim with PENDING status
5. Save claim (ClaimRepository)
6. Return claim details
```

---

## 🗃️ Database Schema

### **Tables**:
1. users
2. roles
3. policies
4. policy_orders
5. policy_subscriptions
6. vehicles
7. vehicle_subscriptions
8. usage_data
9. premium_rules
10. premium_calculations
11. claims

### **Relationships**:
- User ↔ Role (Many-to-One)
- User ↔ Vehicle (One-to-Many)
- User ↔ PolicyOrder (One-to-Many)
- User ↔ PolicySubscription (One-to-Many)
- Policy ↔ PolicyOrder (One-to-Many)
- Policy ↔ PolicySubscription (One-to-Many)
- PolicySubscription ↔ Vehicle (Many-to-Many via VehicleSubscription)
- PolicySubscription ↔ UsageData (One-to-Many)
- PolicySubscription ↔ Claim (One-to-Many)
- PolicySubscription ↔ PremiumCalculation (One-to-Many)
- UsageData ↔ PremiumCalculation (One-to-Many)

---

## 🔧 Configuration Files

### **application.properties**
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/insurance_db
spring.datasource.username=root
spring.datasource.password=password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Server
server.port=8080
```

### **pom.xml** (Dependencies)
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- mysql-connector-java
- jjwt (JWT library)
- lombok
- springdoc-openapi (Swagger)

---

## 🚀 Running the Backend

### **Prerequisites**:
1. JDK 17+
2. MySQL 8.0+
3. Maven 3.6+

### **Setup**:
```bash
# Create database
CREATE DATABASE insurance_db;

# Update application.properties with credentials

# Run application
mvn spring-boot:run
```

### **Access**:
- API: http://localhost:8080/api
- Swagger: http://localhost:8080/swagger-ui.html

---

## 🧪 Testing Endpoints

### **Register User**:
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "roleId": 3
}
```

### **Login**:
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### **Create Policy** (Admin):
```bash
POST http://localhost:8080/api/policies
Authorization: Bearer <token>
Content-Type: application/json

{
  "policyName": "Basic Coverage",
  "coverageType": "COMPREHENSIVE",
  "basePremium": 3000,
  "description": "Basic insurance coverage"
}
```

---

## 📊 Design Patterns Used

1. **Layered Architecture**: Controller → Service → Repository
2. **Strategy Pattern**: Premium rule calculation
3. **DTO Pattern**: Separate request/response objects
4. **Repository Pattern**: Data access abstraction
5. **Dependency Injection**: Spring IoC container
6. **Singleton Pattern**: Spring beans
7. **Factory Pattern**: JPA entity creation

---

## 🔒 Security Features

1. **JWT Authentication**: Stateless token-based auth
2. **Password Encryption**: BCrypt hashing
3. **Role-Based Access Control**: Method-level security
4. **CORS Configuration**: Frontend integration
5. **Exception Handling**: Secure error messages
6. **Input Validation**: DTO validation

---

## 📈 Key Features

1. **RESTful API**: Standard HTTP methods
2. **Pagination**: Large dataset handling
3. **Transaction Management**: Data consistency
4. **Lazy Loading**: Performance optimization
5. **Cascade Operations**: Related entity management
6. **Audit Trail**: Premium calculation history
7. **Flexible Rules**: Dynamic premium calculation

---

## 🎯 Business Logic Highlights

### **Premium Calculation**:
- Base premium from policy
- Dynamic rule application
- Multiple rule types support
- Historical tracking

### **Order Processing**:
- Approval workflow
- Automatic subscription creation
- Status tracking

### **Claims Management**:
- Submission and approval
- Status tracking
- Amount validation

### **Usage Tracking**:
- Monthly data collection
- Risk categorization
- Historical analysis

---

## 📝 API Response Examples

### **Login Success**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "userId": 1,
  "fullName": "John Doe"
}
```

### **Dashboard Summary**:
```json
{
  "activeSubscriptions": 15,
  "totalClaims": 8,
  "pendingClaims": 3,
  "totalRevenue": 52500
}
```

### **Premium Calculation**:
```json
{
  "calculationId": 1,
  "basePremium": 3000,
  "totalPremium": 4500,
  "adjustments": [
    {
      "ruleName": "High Distance Surcharge",
      "adjustment": 1000
    },
    {
      "ruleName": "Night Driving Surcharge",
      "adjustment": 500
    }
  ],
  "calculationDate": "2025-03-01T12:00:00"
}
```

---

## ✅ Review Questions & Answers

**Q: What architecture pattern is used?**
A: Layered architecture with Controller, Service, Repository layers.

**Q: How is security implemented?**
A: JWT-based authentication with Spring Security and BCrypt password encryption.

**Q: What is the Strategy Pattern used for?**
A: Premium rule calculation - different strategies for distance, night driving, and risk category.

**Q: How are relationships managed?**
A: JPA annotations (@OneToMany, @ManyToOne, @ManyToMany) with Hibernate ORM.

**Q: What database is used?**
A: MySQL 8.0 with Spring Data JPA.

**Q: How is exception handling done?**
A: Global exception handler with custom exceptions and standardized error responses.

**Q: What is the role of DTOs?**
A: Separate request/response objects to decouple API from entity structure.

**Q: How is pagination implemented?**
A: Spring Data JPA Pageable interface with page and size parameters.

**Q: What is DataInitializer?**
A: Creates default roles on application startup using @PostConstruct.

**Q: How are premium rules applied?**
A: Rule engine iterates through active rules, selects strategy, checks condition, applies adjustment.

---

**Last Updated**: 2025
**Version**: 1.0
**Status**: Production Ready
