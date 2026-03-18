# DriveIQ - Enterprise-Level Angular Frontend for Usage-Based Insurance Platform

## Project Name: **DriveIQ**
**Tagline**: "Smart Insurance, Smarter Savings"

## Project Overview
Create a professional, enterprise-grade Angular standalone application with Tailwind CSS for DriveIQ - a Usage-Based Insurance (UBI) platform that calculates premiums based on actual driving behavior. The design should be clean, professional, and suitable for senior employees with minimal animations.

**Inspired by**: Progressive Snapshot, Root Insurance, Metromile, Allstate Drivewise

---

## Technology Stack
- **Angular 21** (standalone components)
- **Tailwind CSS** (professional enterprise styling)
- **TypeScript**
- **RxJS**
- **JWT Authentication**
- **HttpClient with Interceptors**
- **Jasmine & Karma** (Unit Testing)

---

## Backend API Configuration
```typescript
BASE_URL = 'http://localhost:8080/api'
```

---

## Branding & Assets

### DriveIQ Logo & Images
```
/assets/images/
  ├── logo.png              (DriveIQ logo - car with speedometer)
  ├── hero-car.png          (Hero section - modern car)
  ├── dashboard-bg.jpg      (Dashboard background - subtle)
  ├── insurance-shield.svg  (Protection icon)
  ├── car-icon.svg          (Vehicle icon)
  ├── claim-icon.svg        (Claims icon)
  └── empty-state.svg       (No data illustration)
```

### Color Scheme (Insurance Industry Standard)
```css
Primary: #1e40af (Trust Blue)
Secondary: #059669 (Safe Green)  
Warning: #d97706 (Alert Amber)
Danger: #dc2626 (Risk Red)
Background: #f8fafc
Text: #0f172a
```

---

## Security & Authentication

### Public Endpoints (No Auth Required)
```
POST /api/auth/register
POST /api/auth/login
```

### Protected Endpoints (JWT Required)
All other endpoints require `Authorization: Bearer <token>` header

### Role-Based Access Control
- **ADMIN**: Full access to all endpoints
- **AGENT**: Access to orders, policies, dashboard
- **CUSTOMER**: Access to own data, vehicles, claims, usage
- **CLAIMS_OFFICER**: Access to claims management

---

## Entity Models (Exact Backend Match)

### 1. User
```typescript
interface User {
  userId: number;
  fullName: string;
  email: string;
  password?: string;  // Only for registration
  phone: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;  // ISO DateTime
}
```

### 2. Role
```typescript
interface Role {
  roleId: number;
  roleName: 'ADMIN' | 'AGENT' | 'CUSTOMER' | 'CLAIMS_OFFICER';
}
```

### 3. Policy
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

### 4. PolicyOrder
```typescript
interface PolicyOrder {
  orderId: number;
  user: User;
  policy: Policy;
  orderDate: string;  // ISO DateTime
  orderStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

### 5. PolicySubscription
```typescript
interface PolicySubscription {
  subscriptionId: number;
  order: PolicyOrder;
  policy: Policy;
  startDate: string;  // ISO Date
  endDate: string;    // ISO Date
  billingCycle: string;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}
```

### 6. Vehicle
```typescript
interface Vehicle {
  vehicleId: number;
  vehicleNumber: string;
  vehicleType: 'CAR' | 'BIKE' | 'SUV' | 'TRUCK';
  vehicleAge: number;
  registrationDate: string;  // ISO Date
  status: 'ACTIVE' | 'INACTIVE';
}
```

### 7. UsageData
```typescript
interface UsageData {
  usageId: number;
  subscription: PolicySubscription;
  billingMonth: number;
  billingYear: number;
  totalDistanceKm: number;
  nightDrivingHours: number;
  tripCount: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

### 8. PremiumRule
```typescript
interface PremiumRule {
  ruleId: number;
  ruleName: string;
  ruleType: 'DISTANCE' | 'NIGHT_DRIVING' | 'RISK_CATEGORY';
  condition: string;
  value: number;
  isActive: boolean;
  description: string;
}
```

### 9. PremiumCalculation
```typescript
interface PremiumCalculation {
  calculationId: number;
  subscription: PolicySubscription;
  usage: UsageData;
  basePremium: number;
  totalAdditions: number;
  totalDiscounts: number;
  finalPremium: number;
  calculatedDate: string;  // ISO DateTime
}
```

### 10. Claim
```typescript
interface Claim {
  claimId: number;
  subscription: PolicySubscription;
  claimAmount: number;
  claimReason: string;
  claimStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedDate: string;  // ISO DateTime
  reviewedBy: User | null;
}
```

### 11. VehicleSubscription
```typescript
interface VehicleSubscription {
  vehicleSubscriptionId: number;
  subscription: PolicySubscription;
  vehicle: Vehicle;
  assignedDate: string;  // ISO Date
}
```

---

## DTOs (Request/Response Objects)

### Auth DTOs
```typescript
interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;  // min 6 chars
  phone: string;
  roleId: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  email: string;
  role: string;
  userId: number;
}
```

### Policy DTOs
```typescript
interface PolicyRequest {
  policyName: string;
  coverageType: string;
  basePremium: number;
  description: string;
}

interface PolicyResponse {
  policyId: number;
  policyName: string;
  coverageType: string;
  basePremium: number;
  description: string;
  isActive: boolean;
}
```

### Vehicle DTOs
```typescript
interface VehicleRequest {
  vehicleNumber: string;
  vehicleType: 'CAR' | 'BIKE' | 'SUV' | 'TRUCK';
  vehicleAge: number;
}

interface VehicleResponse {
  vehicleId: number;
  vehicleNumber: string;
  vehicleType: string;
  vehicleAge: number;
  registrationDate: string;
  status: string;
}
```

### Usage DTOs
```typescript
interface UsageRequest {
  subscriptionId: number;
  billingMonth: number;
  billingYear: number;
  totalDistanceKm: number;
  nightDrivingHours: number;
  tripCount: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface UsageResponse {
  usageId: number;
  subscriptionId: number;
  billingMonth: number;
  billingYear: number;
  totalDistanceKm: number;
  nightDrivingHours: number;
  tripCount: number;
  riskCategory: string;
}
```

### Claim DTOs
```typescript
interface ClaimRequest {
  subscriptionId: number;
  claimAmount: number;
  claimReason: string;
}

interface ClaimResponse {
  claimId: number;
  subscriptionId: number;
  claimAmount: number;
  claimReason: string;
  claimStatus: string;
  submittedDate: string;
  reviewedBy: number | null;
}
```

### Pagination
```typescript
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

---

## Complete API Endpoints

### Authentication (Public)
```
POST   /api/auth/register          Body: RegisterRequest
POST   /api/auth/login             Body: LoginRequest
```

### User Management (ADMIN only)
```
GET    /api/admin/users?page=0&size=10
GET    /api/admin/users/{userId}
PUT    /api/admin/users/{userId}/role?roleId={roleId}
PUT    /api/admin/users/{userId}/deactivate
```

### Policies
```
POST   /api/policies               Body: PolicyRequest (ADMIN)
GET    /api/policies?page=0&size=10
GET    /api/policies/{policyId}
PUT    /api/policies/{policyId}/status?isActive={true/false} (ADMIN)
```

### Policy Orders
```
POST   /api/policy-orders?userId={userId}&policyId={policyId}
GET    /api/policy-orders          (ADMIN, AGENT)
GET    /api/policy-orders/user/{userId}
PUT    /api/policy-orders/{orderId}/approve  (ADMIN, AGENT)
PUT    /api/policy-orders/{orderId}/reject   (ADMIN, AGENT)
```

### Subscriptions
```
GET    /api/subscriptions
GET    /api/subscriptions/{subscriptionId}
GET    /api/subscriptions/user/{userId}
PUT    /api/subscriptions/{subscriptionId}/status?status={status}
```

### Vehicles
```
POST   /api/vehicles               Body: VehicleRequest
GET    /api/vehicles?page=0&size=10
GET    /api/vehicles/{vehicleId}
PUT    /api/vehicles/{vehicleId}   Body: VehicleRequest
DELETE /api/vehicles/{vehicleId}   (ADMIN)
```

### Vehicle Subscriptions
```
POST   /api/vehicle-subscriptions?subscriptionId={id}&vehicleId={id}
GET    /api/vehicle-subscriptions/{subscriptionId}
```

### Usage Tracking
```
POST   /api/usage                  Body: UsageRequest
GET    /api/usage/subscription/{subscriptionId}
GET    /api/usage/subscription/{subscriptionId}/month?month={m}&year={y}
```

### Premium Calculation
```
POST   /api/premium/calculate/{subscriptionId}?usageId={usageId}
GET    /api/premium/history/{subscriptionId}
```

### Premium Rules (ADMIN only)
```
POST   /api/rules                  Body: PremiumRule
GET    /api/rules
PUT    /api/rules/{ruleId}         Body: PremiumRule
DELETE /api/rules/{ruleId}
PUT    /api/rules/{ruleId}/activate
PUT    /api/rules/{ruleId}/deactivate
```

### Claims
```
POST   /api/claims                 Body: ClaimRequest
GET    /api/claims/subscription/{subscriptionId}
GET    /api/claims                 (ADMIN, CLAIMS_OFFICER)
PUT    /api/claims/{claimId}/approve?reviewerId={id} (ADMIN, CLAIMS_OFFICER)
PUT    /api/claims/{claimId}/reject?reviewerId={id}  (ADMIN, CLAIMS_OFFICER)
```

### Dashboard (ADMIN, AGENT)
```
GET    /api/dashboard/summary
GET    /api/dashboard/risk-distribution
GET    /api/dashboard/monthly-revenue
GET    /api/dashboard/active-subscriptions
```

### Agent Dashboard (AGENT only)
```
GET    /api/agent/dashboard/summary
GET    /api/agent/dashboard/pending-orders
GET    /api/agent/dashboard/recent-approvals
```

---

## Project Structure (Feature-Based Architecture)

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── policy.model.ts
│   │       ├── vehicle.model.ts
│   │       └── claim.model.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.spec.ts
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       ├── register.component.html
│   │   │   │       └── register.component.spec.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       └── auth.service.spec.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── admin-dashboard.component.ts
│   │   │   │   ├── policies/
│   │   │   │   │   └── admin-policies.component.ts
│   │   │   │   ├── orders/
│   │   │   │   │   └── admin-orders.component.ts
│   │   │   │   └── users/
│   │   │   │       └── admin-users.component.ts
│   │   │   └── services/
│   │   │       ├── admin.service.ts
│   │   │       └── user-management.service.ts
│   │   │
│   │   ├── customer/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── customer-dashboard.component.ts
│   │   │   │   ├── policies/
│   │   │   │   │   └── customer-policies.component.ts
│   │   │   │   ├── vehicles/
│   │   │   │   │   └── customer-vehicles.component.ts
│   │   │   │   └── claims/
│   │   │   │       └── customer-claims.component.ts
│   │   │   └── services/
│   │   │       ├── vehicle.service.ts
│   │   │       ├── claim.service.ts
│   │   │       └── usage.service.ts
│   │   │
│   │   ├── agent/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── agent-dashboard.component.ts
│   │   │   │   └── orders/
│   │   │   │       └── agent-orders.component.ts
│   │   │   └── services/
│   │   │       └── agent.service.ts
│   │   │
│   │   └── claims-officer/
│   │       ├── components/
│   │       │   ├── dashboard/
│   │       │   │   └── claims-dashboard.component.ts
│   │       │   └── pending/
│   │       │       └── claims-pending.component.ts
│   │       └── services/
│   │           └── claims-officer.service.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   │   └── navbar.component.ts
│   │   │   ├── sidebar/
│   │   │   │   └── sidebar.component.ts
│   │   │   └── loading-spinner/
│   │   │       └── loading-spinner.component.ts
│   │   └── services/
│   │       ├── policy.service.ts
│   │       ├── order.service.ts
│   │       ├── subscription.service.ts
│   │       └── premium.service.ts
│   │
│   └── app.routes.ts
│
├── assets/
│   └── images/
│       ├── logo.png
│       ├── hero-car.png
│       └── ...
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

### Feature Module Pattern

Each feature has:
- **components/** - UI components for that feature
- **services/** - Business logic and API calls for that feature

### Service-Component Relationship Example

**Customer Vehicles Feature:**

```typescript
// features/customer/services/vehicle.service.ts
@Injectable({ providedIn: 'root' })
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  getVehicles(page: number, size: number): Observable<Page<VehicleResponse>> {
    return this.http.get<Page<VehicleResponse>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  createVehicle(request: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.apiUrl, request);
  }
}

// features/customer/components/vehicles/customer-vehicles.component.ts
@Component({
  selector: 'app-customer-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-vehicles.component.html'
})
export class CustomerVehiclesComponent implements OnInit {
  vehicles: VehicleResponse[] = [];
  loading = false;

  constructor(private vehicleService: VehicleService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading = true;
    this.vehicleService.getVehicles(0, 10).subscribe({
      next: (page) => {
        this.vehicles = page.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  addVehicle(request: VehicleRequest) {
    this.vehicleService.createVehicle(request).subscribe({
      next: () => this.loadVehicles()
    });
  }
}
```

---

## Application Structure

### Core Services

#### 1. AuthService
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  register(request: RegisterRequest): Observable<AuthResponse>
  login(request: LoginRequest): Observable<AuthResponse>
  logout(): void
  getToken(): string | null
  isAuthenticated(): boolean
  getCurrentUser(): AuthResponse | null
  getUserRole(): string | null
}
```

#### 2. HTTP Interceptor
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add JWT token to all requests except /api/auth/**
  }
}
```

#### 3. Auth Guard
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Check authentication and role-based access
  }
}
```

---

## Component Structure

### Public Components
- `home.component` - Landing page with 4 portal options
- `login.component` - Login form
- `register.component` - Registration form

### Admin Dashboard
- `admin-dashboard.component` - Overview with stats
- `admin-policies.component` - CRUD policies
- `admin-orders.component` - Approve/reject orders
- `admin-users.component` - User management
- `admin-vehicles.component` - View all vehicles
- `admin-claims.component` - View all claims
- `admin-rules.component` - CRUD premium rules

### Agent Dashboard
- `agent-dashboard.component` - Agent overview
- `agent-orders.component` - Approve/reject orders
- `agent-policies.component` - View policies

### Customer Dashboard
- `customer-dashboard.component` - Customer overview
- `customer-policies.component` - Browse and order policies
- `customer-vehicles.component` - Register/manage vehicles
- `customer-subscriptions.component` - View subscriptions
- `customer-usage.component` - Submit usage data
- `customer-claims.component` - Raise and view claims
- `customer-premium.component` - View premium calculations

### Claims Officer Dashboard
- `claims-dashboard.component` - Claims overview
- `claims-pending.component` - Pending claims with actions
- `claims-history.component` - Approved/rejected claims

### Shared Components
- `navbar.component` - Top navigation with user info
- `sidebar.component` - Side navigation menu
- `stat-card.component` - Reusable statistics card
- `data-table.component` - Reusable table with pagination
- `modal.component` - Reusable modal dialog

---

## Tailwind CSS Design Guidelines

### Color Palette (Professional Enterprise)
```css
Primary: #1e40af (blue-800)
Secondary: #64748b (slate-500)
Success: #059669 (emerald-600)
Warning: #d97706 (amber-600)
Danger: #dc2626 (red-600)
Background: #f8fafc (slate-50)
Card: #ffffff
Text: #0f172a (slate-900)
Text Secondary: #475569 (slate-600)
Border: #e2e8f0 (slate-200)
```

### Typography
```css
Headings: font-semibold, text-slate-900
Body: font-normal, text-slate-600
Small: text-sm, text-slate-500
```

### Layout
- Clean white cards with subtle shadows
- Consistent spacing (p-6, gap-4)
- Rounded corners (rounded-lg)
- Professional borders (border border-slate-200)
- Grid layouts for responsive design

### Buttons
```html
Primary: bg-blue-800 hover:bg-blue-900 text-white
Secondary: bg-slate-200 hover:bg-slate-300 text-slate-700
Success: bg-emerald-600 hover:bg-emerald-700 text-white
Danger: bg-red-600 hover:bg-red-700 text-white
```

### Tables
- Striped rows with hover effects
- Clean borders
- Sticky headers for long tables
- Action buttons in last column

### Forms
- Clear labels above inputs
- Validation messages below fields
- Consistent input styling
- Disabled state styling

### Loading States & Animations
- **Loading Spinner**: Use CSS-only spinner (no GIF files)
  ```html
  <div class="flex justify-center items-center">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
  </div>
  ```
- Simple transitions (transition-colors duration-200)
- Subtle hover effects
- Professional fade-in effects only
- Skeleton loaders for table rows during data fetch

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
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'policies', component: AdminPoliciesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'vehicles', component: AdminVehiclesComponent },
      { path: 'claims', component: AdminClaimsComponent },
      { path: 'rules', component: AdminRulesComponent }
    ]
  },
  
  // Agent Routes
  { 
    path: 'agent', 
    canActivate: [AuthGuard],
    data: { role: 'AGENT' },
    children: [
      { path: 'dashboard', component: AgentDashboardComponent },
      { path: 'orders', component: AgentOrdersComponent },
      { path: 'policies', component: AgentPoliciesComponent }
    ]
  },
  
  // Customer Routes
  { 
    path: 'customer', 
    canActivate: [AuthGuard],
    data: { role: 'CUSTOMER' },
    children: [
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'policies', component: CustomerPoliciesComponent },
      { path: 'vehicles', component: CustomerVehiclesComponent },
      { path: 'subscriptions', component: CustomerSubscriptionsComponent },
      { path: 'usage', component: CustomerUsageComponent },
      { path: 'claims', component: CustomerClaimsComponent },
      { path: 'premium', component: CustomerPremiumComponent }
    ]
  },
  
  // Claims Officer Routes
  { 
    path: 'claims-officer', 
    canActivate: [AuthGuard],
    data: { role: 'CLAIMS_OFFICER' },
    children: [
      { path: 'dashboard', component: ClaimsDashboardComponent },
      { path: 'pending', component: ClaimsPendingComponent },
      { path: 'history', component: ClaimsHistoryComponent }
    ]
  }
];
```

---

## Key Features to Implement

1. **JWT Token Management**
   - Store token in localStorage
   - Auto-attach to all API calls
   - Handle token expiration
   - Redirect to login on 401

2. **Role-Based Navigation**
   - Show only authorized menu items
   - Redirect based on user role after login
   - Protect routes with guards

3. **Error Handling**
   - Global error interceptor
   - User-friendly error messages
   - Toast notifications for success/error

4. **Form Validation**
   - Reactive forms with validators
   - Real-time validation feedback
   - Disable submit until valid

5. **Pagination**
   - Handle Page<T> responses
   - Page size selector
   - Page navigation controls

6. **Loading States**
   - CSS-only spinner (Tailwind animate-spin)
   - Disable buttons during API calls with loading text
   - Skeleton loaders for tables (gray animated bars)
   - Inline loading for specific sections
   - Full-page overlay loader for critical operations

7. **Responsive Design**
   - Mobile-friendly layouts
   - Collapsible sidebar on mobile
   - Responsive tables

---

## Sample Implementation Patterns

### API Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class PolicyService {
  private apiUrl = `${environment.apiUrl}/policies`;

  constructor(private http: HttpClient) {}

  getAllPolicies(page: number, size: number): Observable<Page<PolicyResponse>> {
    return this.http.get<Page<PolicyResponse>>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  createPolicy(request: PolicyRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(this.apiUrl, request);
  }
}
```

### Component Pattern
```typescript
@Component({
  selector: 'app-admin-policies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-policies.component.html'
})
export class AdminPoliciesComponent implements OnInit {
  policies: PolicyResponse[] = [];
  loading = false;
  
  constructor(private policyService: PolicyService) {}
  
  ngOnInit() {
    this.loadPolicies();
  }
  
  loadPolicies() {
    this.loading = true;
    this.policyService.getAllPolicies(0, 10).subscribe({
      next: (page) => {
        this.policies = page.content;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
```

---

## Default Roles (Auto-created by Backend)
```
roleId: 1, roleName: 'ADMIN'
roleId: 2, roleName: 'AGENT'
roleId: 3, roleName: 'CUSTOMER'
roleId: 4, roleName: 'CLAIMS_OFFICER'
```

---

## Environment Configuration
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'DriveIQ'
};
```

---

## Testing Credentials (Create via Register)
```
Admin: admin@insurance.com / password123 (roleId: 1)
Agent: agent@insurance.com / password123 (roleId: 2)
Customer: customer@insurance.com / password123 (roleId: 3)
Claims Officer: claims@insurance.com / password123 (roleId: 4)
```

---

## Additional Requirements

1. **Professional UI/UX**
   - Clean, minimal design
   - Consistent spacing and alignment
   - Clear visual hierarchy
   - Accessible color contrasts

2. **Data Validation**
   - Client-side validation matching backend
   - Email format validation
   - Password minimum 6 characters
   - Required field indicators

3. **User Feedback**
   - Success messages after actions
   - Error messages for failures
   - Confirmation dialogs for destructive actions
   - Loading states during API calls

4. **Performance**
   - Lazy loading for routes
   - Efficient change detection
   - Minimal re-renders
   - Optimized bundle size

5. **Code Quality**
   - TypeScript strict mode
   - Consistent naming conventions
   - Proper error handling
   - Clean code principles

---

## Unique Features That Make This Project Stand Out

### 1. **Real-Time Premium Calculator Widget**
```typescript
// Interactive calculator on customer dashboard
// Shows live premium calculation as user adjusts distance/hours
```

### 2. **Risk Score Visualization**
- Color-coded risk indicators (Green/Yellow/Red)
- Progress bars showing risk levels
- Visual charts for usage patterns

### 3. **Smart Notifications System**
```typescript
interface Notification {
  type: 'ORDER_APPROVED' | 'CLAIM_PROCESSED' | 'PREMIUM_DUE';
  message: string;
  timestamp: string;
  read: boolean;
}
```
- Bell icon with unread count
- Dropdown notification panel
- Auto-refresh every 30 seconds

### 4. **Quick Actions Dashboard Cards**
- One-click actions on dashboard
- "Quick Order Policy" button
- "Submit Usage" shortcut
- "Raise Claim" fast access

### 5. **Advanced Data Export**
- Export tables to CSV
- Download premium history as PDF
- Print-friendly claim reports

### 6. **Search & Filter Capabilities**
- Global search across entities
- Advanced filters (date range, status, type)
- Saved filter presets

### 7. **Breadcrumb Navigation**
```html
Home > Admin > Policies > Edit Policy #123
```

### 8. **Activity Timeline**
- Show recent actions on dashboard
- "Last 5 activities" widget
- Timestamp with relative time ("2 hours ago")

### 9. **Comparison View**
- Compare multiple policies side-by-side
- Premium calculation comparison
- Usage data month-over-month comparison

### 10. **Dark Mode Toggle** (Optional)
- Professional dark theme
- Persisted user preference
- Smooth theme transition

### 11. **Keyboard Shortcuts**
```
Ctrl+K: Global search
Ctrl+N: New order/claim
Esc: Close modal
```

### 12. **Inline Editing**
- Edit table cells directly
- Click to edit, blur to save
- Undo/redo functionality

### 13. **Bulk Actions**
- Select multiple rows with checkboxes
- Bulk approve/reject orders
- Bulk status updates

### 14. **Progressive Disclosure**
- Expandable table rows for details
- Collapsible sections on forms
- "Show more" for long descriptions

### 15. **Smart Form Auto-Save**
- Auto-save draft forms to localStorage
- Restore unsaved data on page reload
- "Draft saved" indicator

### 16. **Contextual Help**
- Tooltip hints on form fields
- "?" icon with helpful information
- Inline validation messages

### 17. **Status Badge System**
```html
<span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  ACTIVE
</span>
```
- Color-coded status badges
- Consistent across all modules

### 18. **Empty State Illustrations**
- Custom SVG illustrations for empty tables
- Helpful messages with action buttons
- "No data yet? Start by..." prompts

### 19. **Confirmation Dialogs**
- Beautiful modal confirmations
- "Are you sure?" for destructive actions
- Undo option for recent actions

### 20. **Performance Metrics**
- Show API response time (dev mode)
- Data freshness indicator
- "Last updated: 2 min ago"

---

## Loading Component Implementation

### Shared Loading Spinner Component
```typescript
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex justify-center items-center p-8">
      <div class="relative">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        <div class="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {}
```

### Skeleton Loader Component
```typescript
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-4">
      <div class="h-4 bg-slate-200 rounded w-3/4"></div>
      <div class="h-4 bg-slate-200 rounded w-1/2"></div>
      <div class="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  `
})
export class SkeletonLoaderComponent {}
```

### Button Loading State
```html
<button 
  [disabled]="loading"
  class="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
  <span *ngIf="loading" class="inline-block animate-spin mr-2">⏳</span>
  {{ loading ? 'Processing...' : 'Submit' }}
</button>
```

---

## Unit Testing

### Testing Framework
- **Jasmine** - Testing framework (default with Angular)
- **Karma** - Test runner

### Test Coverage Requirements
- Services: 80%+ coverage
- Components: 70%+ coverage
- Guards/Interceptors: 90%+ coverage

### Sample Service Test
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login successfully', () => {
    const mockResponse: AuthResponse = {
      token: 'test-token',
      email: 'test@test.com',
      role: 'CUSTOMER',
      userId: 1
    };

    service.login({ email: 'test@test.com', password: 'password' }).subscribe(res => {
      expect(res.token).toBe('test-token');
      expect(res.role).toBe('CUSTOMER');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### Sample Component Test
```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should call authService.login on submit', () => {
    authService.login.and.returnValue(of({
      token: 'test-token',
      email: 'test@test.com',
      role: 'CUSTOMER',
      userId: 1
    }));

    component.loginForm.patchValue({
      email: 'test@test.com',
      password: 'password123'
    });

    component.onSubmit();
    expect(authService.login).toHaveBeenCalled();
  });
});
```

### Run Tests
```bash
# Run all tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in headless mode (CI/CD)
ng test --browsers=ChromeHeadless --watch=false
```

---

This prompt provides complete alignment with your Spring Boot backend, ensuring all entity fields, DTOs, endpoints, and security configurations match exactly. The unique features make this project enterprise-grade and production-ready.
