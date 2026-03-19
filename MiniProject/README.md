# Usage-Based Vehicle Insurance Platform - Backend

## Overview
A comprehensive REST-based insurance platform that dynamically calculates premiums based on actual vehicle usage using Spring Boot.

## Technology Stack
- Java 17+
- Spring Boot 3.x
- Spring Security with JWT
- Spring Data JPA (Hibernate)
- H2 Database (In-Memory)
- Lombok
- Swagger/OpenAPI
- Maven

## Features
- JWT-based authentication and authorization
- Role-based access control (Admin, Agent, Customer, Claims Officer)
- Dynamic premium calculation using Rule Engine (Strategy Pattern)
- Policy order and subscription management
- Vehicle usage tracking
- Claims management
- Dashboard and analytics
- Global exception handling
- Input validation
- Pagination support

## Prerequisites
- JDK 17 or higher
- Maven 3.6+

## Database Setup

The application uses H2 in-memory database which requires no additional setup. The database is automatically created when the application starts.

### H2 Console Access
Access H2 console at: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:insurance_db`
- Username: `sa`
- Password: (leave empty)

## Running the Application

1. Clone the repository
2. Navigate to project directory
3. Run Maven build:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

Access Swagger UI at: `http://localhost:8080/swagger-ui.html`

## Default Roles
The application automatically creates 4 roles on startup:
- ADMIN
- AGENT
- CUSTOMER
- CLAIMS_OFFICER

## API Endpoints Summary

### Authentication APIs
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/{userId}` - Get user by ID
- `PUT /api/admin/users/{userId}/role` - Update user role
- `PUT /api/admin/users/{userId}/deactivate` - Deactivate user

### Vehicle APIs
- `POST /api/vehicles` - Register vehicle
- `GET /api/vehicles` - Get all vehicles (paginated)
- `GET /api/vehicles/{vehicleId}` - Get vehicle by ID
- `PUT /api/vehicles/{vehicleId}` - Update vehicle
- `DELETE /api/vehicles/{vehicleId}` - Delete vehicle

### Policy APIs
- `POST /api/policies` - Create policy (Admin)
- `GET /api/policies` - Get all policies (paginated)
- `GET /api/policies/{policyId}` - Get policy by ID
- `PUT /api/policies/{policyId}/status` - Activate/Deactivate policy

### Policy Order APIs
- `POST /api/policy-orders` - Create policy order
- `GET /api/policy-orders` - Get all orders
- `GET /api/policy-orders/user/{userId}` - Get orders by user
- `PUT /api/policy-orders/{orderId}/approve` - Approve order
- `PUT /api/policy-orders/{orderId}/reject` - Reject order

### Subscription APIs
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/{subscriptionId}` - Get subscription by ID
- `GET /api/subscriptions/user/{userId}` - Get subscriptions by user
- `PUT /api/subscriptions/{subscriptionId}/status` - Update subscription status

### Vehicle Subscription APIs
- `POST /api/vehicle-subscriptions` - Attach vehicle to subscription
- `GET /api/vehicle-subscriptions/{subscriptionId}` - Get vehicles by subscription

### Usage Tracking APIs
- `POST /api/usage` - Add monthly usage
- `GET /api/usage/subscription/{subscriptionId}` - Get usage by subscription
- `GET /api/usage/subscription/{subscriptionId}/month` - Get usage by month

### Premium Calculation APIs
- `POST /api/premium/calculate/{subscriptionId}` - Calculate premium
- `GET /api/premium/history/{subscriptionId}` - Get premium history

### Premium Rule Management (Admin)
- `POST /api/rules` - Create rule
- `GET /api/rules` - Get all rules
- `PUT /api/rules/{ruleId}/activate` - Activate rule
- `PUT /api/rules/{ruleId}/deactivate` - Deactivate rule
- `PUT /api/rules/{ruleId}` - Update rule
- `DELETE /api/rules/{ruleId}` - Delete rule

### Claims APIs
- `POST /api/claims` - Raise claim
- `GET /api/claims/subscription/{subscriptionId}` - Get claims by subscription
- `GET /api/claims` - Get all claims
- `PUT /api/claims/{claimId}/approve` - Approve claim
- `PUT /api/claims/{claimId}/reject` - Reject claim

### Dashboard APIs
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/risk-distribution` - Risk distribution
- `GET /api/dashboard/monthly-revenue` - Monthly revenue estimate
- `GET /api/dashboard/active-subscriptions` - Active subscriptions count

## Premium Rule Engine

The system uses Strategy Pattern for dynamic premium calculation:

### Rule Types:
1. **DISTANCE** - Based on total distance driven
2. **NIGHT_DRIVING** - Based on night driving hours
3. **RISK_CATEGORY** - Based on risk category (LOW, MEDIUM, HIGH)

### Example Rules:
```json
{
  "ruleName": "High Distance Surcharge",
  "ruleType": "DISTANCE",
  "condition": "> 10000",
  "value": 1000,
  "isActive": true
}
```

## Sample API Requests

### Register User
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "roleId": 3
}
```

### Create Policy Order
```json
POST /api/policy-orders?userId=1&policyId=1
```

### Add Usage Data
```json
POST /api/usage
{
  "subscriptionId": 1,
  "billingMonth": 1,
  "billingYear": 2025,
  "totalDistanceKm": 8000,
  "nightDrivingHours": 20,
  "tripCount": 50,
  "riskCategory": "LOW"
}
```

### Calculate Premium
```json
POST /api/premium/calculate/1?usageId=1
```

## Security
- All endpoints (except auth) require JWT token
- Token must be passed in Authorization header: `Bearer <token>`
- Role-based access control enforced on sensitive endpoints

## Architecture
The application follows layered architecture:
- **Controller Layer** - REST endpoints
- **Service Layer** - Business logic
- **Repository Layer** - Data access
- **Entity Layer** - JPA entities
- **DTO Layer** - Data transfer objects
- **Security Layer** - JWT authentication
- **Exception Layer** - Global exception handling

## Testing
Run tests using:
```bash
mvn test
```

## Docker Support
Create Dockerfile:
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
docker build -t insurance-backend .
docker run -p 8080:8080 insurance-backend
```

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
MIT License
