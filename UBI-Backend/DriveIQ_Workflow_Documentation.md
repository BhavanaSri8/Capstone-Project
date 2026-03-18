# DriveIQ – Workflow Documentation

## Introduction
This document provides a detailed technical overview of the primary business workflows implemented in the **DriveIQ – Usage-Based Vehicle Insurance Platform**. Each workflow is described from the user interaction at the Angular frontend to the service logic and database operations in the Spring Boot backend.

## System Workflow Overview
The DriveIQ system follows a layered architecture (Controller -> Service -> Repository) with a secure JWT-based authentication layer. Key workflows cover the entire insurance lifecycle: from user onboarding and vehicle registration to policy subscription, dynamic premium calculation based on driving behavior (telematics), claim processing, and administrative oversight.

---

## Detailed Workflow Descriptions

### 1. User Registration Workflow
**Actors Involved**: Customer
**Modules Involved**: Authentication, User Management
**Controllers Used**: `AuthController`
**Services Used**: `AuthService`
**Repositories Used**: `UserRepository`, `RoleRepository`
**Database Entities**: `User`, `Role`
**Workflow Steps**:
1. Customer fills the registration form on the Angular frontend.
2. Frontend sends a POST request to `/api/auth/register`.
3. `AuthService` validates if the email already exists.
4. `RoleRepository` fetches the default "CUSTOMER" role.
5. `AuthService` encodes the password using `PasswordEncoder`.
6. `UserRepository` saves the new `User` entity with "ACTIVE" status.
7. Frontend receives a success response and redirects to the login page.

### 2. User Login (JWT Authentication) Workflow
**Actors Involved**: All Users (Customer/Admin/Underwriter/Claims Officer)
**Modules Involved**: Authentication
**Controllers Used**: `AuthController`
**Services Used**: `AuthService`
**Repositories Used**: `UserRepository`
**External Systems**: JWT (Token Generation)
**Workflow Steps**:
1. User enters credentials in the login form.
2. Frontend sends POST request to `/api/auth/login`.
3. `AuthService` authenticates the user via `AuthenticationManager`.
4. Upon successful authentication, a JWT token is generated containing the user's email and role.
5. Backend returns the JWT token and user details to the frontend.
6. Frontend stores the token in `localStorage` and redirects the user to their respective dashboard.

### 3. Vehicle Registration Workflow
**Actors Involved**: Customer
**Modules Involved**: Vehicle Management
**Controllers Used**: `VehicleController`
**Services Used**: `VehicleService`
**Repositories Used**: `VehicleRepository`
**Database Entities**: `Vehicle`
**Workflow Steps**:
1. Customer navigates to the "My Vehicles" section and clicks "Register Vehicle".
2. Customer enters vehicle details (Number, Type, Age, Registration Date).
3. Frontend sends POST request to `/api/vehicles`.
4. `VehicleService` validates the vehicle data and ensures the vehicle number is unique.
5. `VehicleRepository` saves the `Vehicle` entity.
6. Customer can now select this vehicle for policy applications.

### 4. Policy Application Workflow
**Actors Involved**: Customer, Underwriter
**Modules Involved**: Policy Management, Notifications
**Controllers Used**: `PolicyOrderController`
**Services Used**: `PolicyOrderService`, `NotificationService`
**Repositories Used**: `PolicyOrderRepository`, `UserRepository`, `PolicyRepository`
**Database Entities**: `PolicyOrder`, `Policy`, `Vehicle`, `User`
**Workflow Steps**:
1. Customer selects a policy and an existing vehicle.
2. Customer uploads identity or ownership documents.
3. Frontend sends a multipart POST request to `/api/policy-orders`.
4. `PolicyOrderService` validates the files and stores them on the server.
5. `PolicyOrderRepository` saves the `PolicyOrder` with status `PENDING`.
6. `NotificationService` creates a notification for users with the `UNDERWRITER` role.

### 5. Policy Approval Workflow (Underwriter Review)
**Actors Involved**: Underwriter
**Modules Involved**: Policy Management, Notifications
**Controllers Used**: `UnderwriterController`, `PolicyOrderController`
**Services Used**: `PolicyOrderService`, `UnderwriterService`, `NotificationService`
**Repositories Used**: `PolicyOrderRepository`, `PolicySubscriptionRepository`, `VehicleSubscriptionRepository`
**Database Entities**: `PolicyOrder`, `PolicySubscription`, `VehicleSubscription`
**Workflow Steps**:
1. Underwriter views pending applications in their dashboard.
2. Underwriter reviews the customer's risk profile and uploaded documents.
3. Underwriter clicks "Approve".
4. `PolicyOrderService` updates the order status to `APPROVED`.
5. `PolicySubscriptionRepository` creates a new `PolicySubscription` entry (linking to the order).
6. If a vehicle was selected, `VehicleSubscriptionRepository` links the vehicle to the new subscription.
7. `NotificationService` notifies the Customer of the approval.

### 6. Premium Calculation Workflow (Usage-Based Logic)
**Actors Involved**: System (Automated/Triggered)
**Modules Involved**: Premium Rule Engine, Usage Analytics
**Controllers Used**: `PremiumController`
**Services Used**: `PremiumService`, `PremiumRuleEngine`, `UsageService`
**Repositories Used**: `UsageDataRepository`, `PremiumRuleRepository`, `PremiumCalculationRepository`
**Database Entities**: `UsageData`, `PremiumRule`, `PremiumCalculation`, `PolicySubscription`
**Workflow Steps**:
1. Vehicle usage data (distance, night driving, trip count) is submitted to `/api/usage`.
2. `PremiumService` triggers `calculatePremium` for the current billing cycle.
3. `PremiumRuleEngine` retrieves all active rules from `PremiumRuleRepository`.
4. The system applies `DistanceRuleStrategy`, `NightDrivingRuleStrategy`, and `RiskCategoryRuleStrategy`.
5. Adjusted premiums (discounts/additions) are calculated based on the base premium.
6. `PremiumCalculationRepository` saves the final breakdown.
7. Customer views the calculated premium in their dashboard.

### 7. Payment Simulation Workflow
**Actors Involved**: Customer
**Modules Involved**: Payments
**Controllers Used**: `PaymentController`
**Services Used**: `PaymentService`
**Repositories Used**: `PaymentRepository`, `PolicySubscriptionRepository`
**External Systems**: Razorpay Integrated (Simulated)
**Workflow Steps**:
1. Customer clicks "Pay Premium" for an active subscription.
2. Frontend sends request to `/api/payments/simulate`.
3. `PaymentService` initializes a payment order metadata.
4. If "Successful", `PaymentRepository` saves a "COMPLETED" payment record.
5. The system updates the `PolicySubscription` status if applicable (e.g., mark as paid).
6. `PdfInvoiceService` (called internally) can generate an invoice for the transaction.

### 8. Claim Submission Workflow
**Actors Involved**: Customer
**Modules Involved**: Claim Management, Notifications
**Controllers Used**: `ClaimController`
**Services Used**: `ClaimService`, `NotificationService`
**Repositories Used**: `ClaimRepository`, `PolicySubscriptionRepository`
**Database Entities**: `Claim`, `PolicySubscription`
**Workflow Steps**:
1. Customer creates a claim for a specific subscription.
2. Customer provides the claim amount, reason, and supporting documents (photos, reports).
3. Frontend sends multipart POST request to `/api/claims`.
4. `ClaimService` validates that the subscription is active.
5. `ClaimRepository` saves the claim with status `PENDING`.
6. `NotificationService` triggers a notification for users with the `CLAIMS_OFFICER` role.

### 9. Claim Review and Approval Workflow
**Actors Involved**: Claims Officer
**Modules Involved**: Claim Management, Notifications
**Controllers Used**: `ClaimController`
**Services Used**: `ClaimService`, `NotificationService`, `EmailService`
**Repositories Used**: `ClaimRepository`, `UserRepository`
**Database Entities**: `Claim`, `User`
**Workflow Steps**:
1. Claims Officer retrieves all pending claims.
2. Claims Officer reviews the incident history and documents.
3. Claims Officer updates status to `APPROVED` or `REJECTED`.
4. `ClaimRepository` saves the reviewer's ID and final status.
5. `NotificationService` sends an in-app alert to the customer.
6. `EmailService` sends an automated email with the claim decision.

### 10. Notification / Email Workflow
**Actors Involved**: System (Trigger)
**Modules Involved**: Notification System
**Controllers Used**: `NotificationController`
**Services Used**: `NotificationService`, `EmailService`
**Repositories Used**: `NotificationRepository`
**Database Entities**: `Notification`
**External Systems**: SMTP (JavaMailSender)
**Workflow Steps**:
1. A business event occurs (e.g., Approval, Payment Due, New Claim).
2. The calling service invokes `notificationService.createNotification()`.
3. `NotificationRepository` saves the alert for the specific user.
4. If an email is required, `EmailService` uses `JavaMailSender` to send an SMTP message to the user's registered email.
5. Customer views the unread count on the frontend via periodic polling or manual refresh.

### 11. Admin Dashboard Data Aggregation Workflow
**Actors Involved**: Admin
**Modules Involved**: Admin Dashboard, Analytics
**Controllers Used**: `DashboardController`, `StatisticsController`
**Services Used**: `DashboardService`, `StatisticsService`
**Repositories Used**: All Repositories (User, Policy, Claim, etc.)
**Workflow Steps**:
1. Admin logs into the Admin Dashboard.
2. Frontend sends GET requests to `/api/dashboard/summary` and `/api/statistics/dashboard`.
3. `DashboardService` performs aggregate counts (total users, active subscriptions, pending orders).
4. `StatisticsService` calculates complex data like monthly revenue trends and risk category distribution.
5. For revenue, `paymentRepository.sumRevenueByMonth()` is used to gather historical data.
6. The aggregated data is returned as a JSON object and visualized on the frontend using charts.
