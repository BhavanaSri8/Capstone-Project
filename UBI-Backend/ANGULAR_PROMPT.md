# Angular 21 Frontend Prompt for Usage-Based Insurance (UBI) Platform

## Project Requirements

Create a complete Angular 21 standalone application for a Usage-Based Insurance platform with Tailwind CSS styling that matches the Spring Boot backend.

---

## Technical Stack
- Angular 21 (standalone: true)
- Tailwind CSS
- TypeScript
- RxJS
- Angular Router
- HttpClient
- JWT Authentication

---

## Backend API Base URL
```
http://localhost:8080/api
```

---

## Entity Models (Match Backend Exactly)

### 1. User Model
```typescript
interface User {
  userId: number;
  fullName: string;
  email: string;
  password?: string;  // Only for registration
  phone: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
}
```

### 2. Role Model
```typescript
interface Role {
  roleId: number;
  roleName: 'ADMIN' | 'AGENT' | 'CUSTOMER' | 'CLAIMS_OFFICER';
}
```

### 3. Policy Model
```typescript
interface Policy {
  policyId: number;
  policyName: string;
  coverageType: string;
  basePremium: number;
  description: string;
  isActive: boolean;
}
```

### 4. PolicyOrder Model
```typescript
interface PolicyOrder {
  orderId: number;
  orderDate: Date;
  orderStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: User;
  policy: Policy;
}
```

### 5. PolicySubscription Model
```typescript
interface PolicySubscription {
  subscriptionId: number;
  startDate: Date;
  endDate: Date;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  user: User;
  policy: Policy;
}
```

### 6. Vehicle Model
```typescript
interface Vehicle {
  vehicleId: number;
  vehicleNumber: string;
  vehicleType: 'CAR' | 'BIKE' | 'SUV' | 'TRUCK';
  vehicleAge: number;
  status: 'ACTIVE' | 'INACTIVE';
  owner: User;
}
```

### 7. UsageData Model
```typescript
interface UsageData {
  usageId: number;
  billingMonth: number;
  billingYear: number;
  totalDistanceKm: number;
  nightDrivingHours: number;
  tripCount: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  subscription: PolicySubscription;
}
```

### 8. PremiumRule Model
```typescript
interface PremiumRule {
  ruleId: number;
  ruleName: string;
  ruleType: 'DISTANCE' | 'NIGHT_DRIVING' | 'RISK_CATEGORY';
  condition: string;
  value: number;
  isActive: boolean;
}
```

### 9. PremiumCalculation Model
```typescript
interface PremiumCalculation {
  calculationId: number;
  basePremium: number;
  totalPremium: number;
  calculationDate: Date;
  subscription: PolicySubscription;
  usageData: UsageData;
}
```

### 10. Claim Model
```typescript
interface Claim {
  claimId: number;
  claimAmount: number;
  claimReason: string;
  claimDate: Date;
  claimStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  subscription: PolicySubscription;
}
```

### 11. VehicleSubscription Model
```typescript
interface VehicleSubscription {
  id: number;
  vehicle: Vehicle;
  subscription: PolicySubscription;
}
```

---

## API Endpoints to Implement

### Authentication APIs
```
POST   /api/auth/register
POST   /api/auth/login
```

### User Management APIs (Admin)
```
GET    /api/admin/users?page=0&size=10
GET    /api/admin/users/{userId}
PUT    /api/admin/users/{userId}/role
PUT    /api/admin/users/{userId}/deactivate
```

### Policy APIs
```
POST   /api/policies
GET    /api/policies?page=0&size=10
GET    /api/policies/{policyId}
PUT    /api/policies/{policyId}/status
```

### Policy Order APIs
```
POST   /api/policy-orders?userId={userId}&policyId={policyId}
GET    /api/policy-orders
GET    /api/policy-orders/user/{userId}
PUT    /api/policy-orders/{orderId}/approve
PUT    /api/policy-orders/{orderId}/reject
```

### Subscription APIs
```
GET    /api/subscriptions
GET    /api/subscriptions/{subscriptionId}
GET    /api/subscriptions/user/{userId}
PUT    /api/subscriptions/{subscriptionId}/status
```

### Vehicle APIs
```
POST   /api/vehicles
GET    /api/vehicles?page=0&size=10
GET    /api/vehicles/{vehicleId}
PUT    /api/vehicles/{vehicleId}
DELETE /api/vehicles/{vehicleId}
```

### Vehicle Subscription APIs
```
POST   /api/vehicle-subscriptions
GET    /api/vehicle-subscriptions/{subscriptionId}
```

### Usage Tracking APIs
```
POST   /api/usage
GET    /api/usage/subscription/{subscriptionId}
GET    /api/usage/subscription/{subscriptionId}/month?month={month}&year={year}
```

### Premium Calculation APIs
```
POST   /api/premium/calculate/{subscriptionId}?usageId={usageId}
GET    /api/premium/history/{subscriptionId}
```

### Premium Rule APIs (Admin)
```
POST   /api/rules
GET    /api/rules
PUT    /api/rules/{ruleId}
DELETE /api/rules/{ruleId}
PUT    /api/rules/{ruleId}/activate
PUT    /api/rules/{ruleId}/deactivate
```

### Claims APIs
```
POST   /api/claims
GET    /api/claims/subscription/{subscriptionId}
GET    /api/claims
PUT    /api/claims/{claimId}/approve
PUT    /api/claims/{claimId}/reject
```

### Dashboard APIs
```
GET    /api/dashboard/summary
GET    /api/dashboard/risk-distribution
GET    /api/dashboard/monthly-revenue
GET    /api/dashboard/active-subscriptions
```

---

## Application Structure

### Required Components (Standalone)

#### 1. Authentication Components
- `login.component.ts` - Login page with role-based routing
- `register.component.ts` - User registration
- `home.component.ts` - Landing page with portal selection

#### 2. Admin Dashboard Components
- `admin-dashboard.component.ts` - Main admin dashboard
- `admin-policies.component.ts` - Policy management (CRUD)
- `admin-orders.component.ts` - Order approval/rejection
- `admin-vehicles.component.ts` - View all vehicles
- `admin-users.component.ts` - User management
- `admin-claims.component.ts` - View all claims
- `admin-rules.component.ts` - Premium rule management (CRUD)

#### 3. Customer Dashboard Components
- `customer-dashboard.component.ts` - Customer overview
- `customer-policies.component.ts` - View/order policies
- `customer-vehicles.component.ts` - Register/manage vehicles
- `customer-claims.component.ts` - Raise/view claims
- `customer-usage.component.ts` - Submit/view usage data

#### 4. Agent Dashboard Components
- `agent-dashboard.component.ts` - Agent overview
- `agent-orders.component.ts` - Approve/reject orders
- `agent-policies.component.ts` - View policies

#### 5. Claims Officer Dashboard Components
- `claims-dashboard.component.ts` - Claims overview
- `claims-pending.component.ts` - Pending claims with approve/reject
- `claims-approved.component.ts` - Approved claims history
- `claims-rejected.component.ts` - Rejected claims history
- `claims-all.component.ts` - All claims view

#### 6. Shared Components
- `navbar.component.ts` - Navigation bar with user info
- `sidebar.component.ts` - Dashboard sidebar navigation
- `stat-card.component.ts` - Reusable stat card
- `table.component.ts` - Reusable data table
- `modal.component.ts` - Reusable modal dialog

---

## Services Required

### 1. AuthService
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  register(data: RegisterRequest): Observable<AuthResponse>
  login(data: LoginRequest): Observable<AuthResponse>
  logout(): void
  getToken(): string | null
  isAuthenticated(): boolean
  getUserRole(): string | null
}
```

### 2. PolicyService
```typescript
@Injectable({ providedIn: 'root' })
export class PolicyService {
  createPolicy(policy: Policy): Observable<Policy>
  getAllPolicies(page: number, size: number): Observable<Page<Policy>>
  getPolicyById(id: number): Observable<Policy>
  updatePolicyStatus(id: number, isActive: boolean): Observable<Policy>
}
```

### 3. VehicleService
```typescript
@Injectable({ providedIn: 'root' })
export class VehicleService {
  registerVehicle(vehicle: Vehicle): Observable<Vehicle>
  getAllVehicles(page: number, size: number): Observable<Page<Vehicle>>
  getVehicleById(id: number): Observable<Vehicle>
  updateVehicle(id: number, vehicle: Vehicle): Observable<Vehicle>
  deleteVehicle(id: number): Observable<void>
}
```

### 4. OrderService
```typescript
@Injectable({ providedIn: 'root' })
export class OrderService {
  createOrder(userId: number, policyId: number): Observable<PolicyOrder>
  getAllOrders(): Observable<PolicyOrder[]>
  getOrdersByUser(userId: number): Observable<PolicyOrder[]>
  approveOrder(orderId: number): Observable<PolicySubscription>
  rejectOrder(orderId: number): Observable<PolicyOrder>
}
```

### 5. UsageService
```typescript
@Injectable({ providedIn: 'root' })
export class UsageService {
  addUsage(usage: UsageData): Observable<UsageData>
  getUsageBySubscription(subscriptionId: number): Observable<UsageData[]>
  getUsageByMonth(subscriptionId: number, month: number, year: number): Observable<UsageData>
}
```

### 6. PremiumService
```typescript
@Injectable({ providedIn: 'root' })
export class PremiumService {
  calculatePremium(subscriptionId: number, usageId: number): Observable<PremiumCalculation>
  getPremiumHistory(subscriptionId: number): Observable<PremiumCalculation[]>
}
```

### 7. ClaimService
```typescript
@Injectable({ providedIn: 'root' })
export class ClaimService {
  raiseClaim(claim: Claim): Observable<Claim>
  getClaimsBySubscription(subscriptionId: number): Observable<Claim[]>
  getAllClaims(): Observable<Claim[]>
  approveClaim(claimId: number): Observable<Claim>
  rejectClaim(claimId: number): Observable<Claim>
}
```

### 8. RuleService
```typescript
@Injectable({ providedIn: 'root' })
export class RuleService {
  createRule(rule: PremiumRule): Observable<PremiumRule>
  getAllRules(): Observable<PremiumRule[]>
  updateRule(id: number, rule: PremiumRule): Observable<PremiumRule>
  deleteRule(id: number): Observable<void>
  activateRule(id: number): Observable<PremiumRule>
  deactivateRule(id: number): Observable<PremiumRule>
}
```

### 9. DashboardService
```typescript
@Injectable({ providedIn: 'root' })
export class DashboardService {
  getSummary(): Observable<DashboardSummary>
  getRiskDistribution(): Observable<RiskDistribution>
  getMonthlyRevenue(): Observable<number>
  getActiveSubscriptions(): Observable<number>
}
```

### 10. UserService
```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  getAllUsers(page: number, size: number): Observable<Page<User>>
  getUserById(id: number): Observable<User>
  updateUserRole(id: number, roleId: number): Observable<User>
  deactivateUser(id: number): Observable<User>
}
```

---

## Guards Required

### 1. AuthGuard
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  // Check if user is authenticated
  // Redirect to login if not
}
```

### 2. RoleGuard
```typescript
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  // Check if user has required role
  // Redirect to unauthorized if not
}
```

---

## Interceptors Required

### 1. JwtInterceptor
```typescript
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Add JWT token to all requests
  // Add Authorization: Bearer <token> header
}
```

### 2. ErrorInterceptor
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // Handle HTTP errors globally
  // Show error messages
  // Logout on 401 Unauthorized
}
```

---

## Routing Structure

```typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Admin Routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'policies', component: AdminPoliciesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'vehicles', component: AdminVehiclesComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'claims', component: AdminClaimsComponent },
      { path: 'rules', component: AdminRulesComponent }
    ]
  },
  
  // Customer Routes
  {
    path: 'customer',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CUSTOMER'] },
    children: [
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'policies', component: CustomerPoliciesComponent },
      { path: 'vehicles', component: CustomerVehiclesComponent },
      { path: 'claims', component: CustomerClaimsComponent },
      { path: 'usage', component: CustomerUsageComponent }
    ]
  },
  
  // Agent Routes
  {
    path: 'agent',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['AGENT'] },
    children: [
      { path: 'dashboard', component: AgentDashboardComponent },
      { path: 'orders', component: AgentOrdersComponent },
      { path: 'policies', component: AgentPoliciesComponent }
    ]
  },
  
  // Claims Officer Routes
  {
    path: 'claims-officer',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLAIMS_OFFICER'] },
    children: [
      { path: 'dashboard', component: ClaimsDashboardComponent },
      { path: 'pending', component: ClaimsPendingComponent },
      { path: 'approved', component: ClaimsApprovedComponent },
      { path: 'rejected', component: ClaimsRejectedComponent },
      { path: 'all', component: ClaimsAllComponent }
    ]
  },
  
  { path: '**', redirectTo: '' }
];
```

---

## Tailwind CSS Styling Requirements

### 1. Color Scheme
```css
Primary: #00d2ff (Cyan)
Secondary: #3a7bd5 (Blue)
Background: #0a0e27 (Dark Navy)
Card Background: #1e2139 to #252a47 (Dark Gradient)
Text: #ffffff (White), #b8c5d6 (Light Gray)
Success: #00f260 to #0575e6 (Green Gradient)
Warning: #f7971e to #ffd200 (Orange Gradient)
Danger: #eb3349 to #f45c43 (Red Gradient)
```

### 2. Dashboard Cards
```html
<!-- Stat Card Template -->
<div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
  <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
  <div class="relative z-10">
    <div class="flex items-center justify-between mb-4">
      <div class="text-white text-opacity-80 text-sm font-semibold uppercase tracking-wider">Title</div>
      <svg class="w-8 h-8 text-white text-opacity-60"><!-- Icon --></svg>
    </div>
    <p class="text-5xl font-bold text-white">{{ value }}</p>
    <div class="mt-4 text-white text-opacity-80 text-sm">Subtitle</div>
  </div>
</div>
```

### 3. Sidebar Navigation
```html
<nav class="w-64 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen p-6">
  <h2 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
    🚗 UBI Insurance
  </h2>
  <a class="block px-4 py-3 text-gray-300 hover:bg-cyan-500 hover:bg-opacity-10 hover:text-cyan-400 rounded-lg transition-all mb-2">
    Dashboard
  </a>
</nav>
```

### 4. Data Tables
```html
<table class="w-full">
  <thead class="bg-cyan-500 bg-opacity-5">
    <tr>
      <th class="px-6 py-4 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">Header</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-cyan-500 divide-opacity-10">
    <tr class="hover:bg-cyan-500 hover:bg-opacity-5 transition-colors">
      <td class="px-6 py-4 text-gray-300">Data</td>
    </tr>
  </tbody>
</table>
```

### 5. Buttons
```html
<!-- Primary Button -->
<button class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all hover:-translate-y-1">
  Button
</button>

<!-- Success Button -->
<button class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-500/50 transition-all">
  Approve
</button>

<!-- Danger Button -->
<button class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-red-500/50 transition-all">
  Reject
</button>
```

### 6. Form Inputs
```html
<input type="text" 
  class="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-cyan-500 border-opacity-20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20 transition-all">
```

### 7. Modal
```html
<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
  <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-cyan-500 border-opacity-20">
    <h3 class="text-2xl font-bold text-white mb-4">Modal Title</h3>
    <div class="text-gray-300">Content</div>
  </div>
</div>
```

---

## Additional Requirements

### 1. JWT Token Storage
- Store JWT token in localStorage
- Include token in all API requests via interceptor
- Clear token on logout

### 2. Error Handling
- Display error messages using toast notifications
- Handle 401 Unauthorized (redirect to login)
- Handle 403 Forbidden (show access denied)
- Handle 404 Not Found
- Handle 500 Server Error

### 3. Loading States
- Show loading spinner during API calls
- Disable buttons during submission
- Show skeleton loaders for tables

### 4. Form Validation
- Required field validation
- Email format validation
- Password strength validation
- Number range validation
- Custom error messages

### 5. Pagination
- Implement pagination for all list views
- Page size: 10 items per page
- Show page numbers and navigation

### 6. Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Collapsible sidebar on mobile
- Touch-friendly buttons

### 7. Animations
- Smooth page transitions
- Card hover effects
- Button hover effects
- Loading animations

---

## Environment Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

---

## Installation Commands

```bash
# Create Angular 21 project
ng new ubi-insurance-frontend --standalone --routing --style=css

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Install dependencies
npm install @angular/common @angular/forms rxjs

# Generate components (examples)
ng generate component components/login --standalone
ng generate component components/admin-dashboard --standalone
ng generate service services/auth
ng generate guard guards/auth
ng generate interceptor interceptors/jwt
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d2ff',
        secondary: '#3a7bd5',
        dark: '#0a0e27',
      }
    },
  },
  plugins: [],
}
```

---

## Key Features to Implement

1. ✅ Role-based authentication and routing
2. ✅ JWT token management
3. ✅ CRUD operations for all entities
4. ✅ Dashboard with statistics
5. ✅ Policy order workflow (create → approve → subscription)
6. ✅ Premium calculation with rule engine
7. ✅ Claims management workflow
8. ✅ Vehicle registration and management
9. ✅ Usage data tracking
10. ✅ Responsive design with Tailwind CSS
11. ✅ Error handling and validation
12. ✅ Loading states and animations
13. ✅ Pagination for all lists
14. ✅ Search and filter functionality

---

**Generate a complete, production-ready Angular 21 standalone application with all the above specifications, matching all backend entity fields exactly, using Tailwind CSS for styling with the specified color scheme and design patterns.**
