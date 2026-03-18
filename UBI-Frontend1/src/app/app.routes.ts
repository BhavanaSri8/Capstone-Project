import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
    { path: 'login', loadComponent: () => import('./features/auth/components/login/login.component').then((m) => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./features/auth/components/register/register.component').then((m) => m.RegisterComponent) },
    { path: 'forgot-password', loadComponent: () => import('./features/auth/components/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
    { path: 'reset-password', loadComponent: () => import('./features/auth/components/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent) },

    { path: 'admin/dashboard', loadComponent: () => import('./features/admin/components/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/policies', loadComponent: () => import('./features/admin/components/policies/admin-policies.component').then((m) => m.AdminPoliciesComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/orders', loadComponent: () => import('./features/admin/components/orders/admin-orders.component').then((m) => m.AdminOrdersComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/users', loadComponent: () => import('./features/admin/components/users/admin-users.component').then((m) => m.AdminUsersComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/vehicles', loadComponent: () => import('./features/admin/components/vehicles/admin-vehicles.component').then((m) => m.AdminVehiclesComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/claims', loadComponent: () => import('./features/admin/components/claims/admin-claims.component').then((m) => m.AdminClaimsComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/rules', loadComponent: () => import('./features/admin/components/rules/admin-rules.component').then((m) => m.AdminRulesComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/statistics', loadComponent: () => import('./features/admin/components/statistics/statistics.component').then((m) => m.StatisticsComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },
    { path: 'admin/payments', loadComponent: () => import('./features/admin/components/payments/admin-payments.component').then((m) => m.AdminPaymentsComponent), canActivate: [authGuard], data: { role: 'ADMIN' } },


    { path: 'customer/dashboard', loadComponent: () => import('./features/customer/components/dashboard/customer-dashboard.component').then((m) => m.CustomerDashboardComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/policies', loadComponent: () => import('./features/customer/components/policies/customer-policies.component').then((m) => m.CustomerPoliciesComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/vehicles', loadComponent: () => import('./features/customer/components/vehicles/customer-vehicles.component').then((m) => m.CustomerVehiclesComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/subscriptions', loadComponent: () => import('./features/customer/components/subscriptions/customer-subscriptions.component').then((m) => m.CustomerSubscriptionsComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/usage', loadComponent: () => import('./features/customer/components/usage/customer-usage.component').then((m) => m.CustomerUsageComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/claims', loadComponent: () => import('./features/customer/components/claims/customer-claims.component').then((m) => m.CustomerClaimsComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/premium', loadComponent: () => import('./features/customer/components/premium/customer-premium.component').then((m) => m.CustomerPremiumComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/payments', loadComponent: () => import('./features/customer/components/payments/customer-payments.component').then((m) => m.CustomerPaymentsComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },
    { path: 'customer/payments/checkout/:orderId', loadComponent: () => import('./features/customer/components/payments/checkout/payment-checkout.component').then((m) => m.PaymentCheckoutComponent), canActivate: [authGuard], data: { role: 'CUSTOMER' } },

    { path: 'claims/dashboard', loadComponent: () => import('./features/claims-officer/components/dashboard/claims-dashboard.component').then((m) => m.ClaimsDashboardComponent), canActivate: [authGuard], data: { role: 'CLAIMS_OFFICER' } },
    { path: 'claims/manage', loadComponent: () => import('./features/claims-officer/components/pending/claims-pending.component').then((m) => m.ClaimsPendingComponent), canActivate: [authGuard], data: { role: 'CLAIMS_OFFICER' } },
    { path: 'claims/history', loadComponent: () => import('./features/claims-officer/components/history/claims-history.component').then((m) => m.ClaimsHistoryComponent), canActivate: [authGuard], data: { role: 'CLAIMS_OFFICER' } },

    { path: 'claims-officer/dashboard', redirectTo: 'claims/dashboard', pathMatch: 'full' },
    { path: 'claims-officer/pending', redirectTo: 'claims/manage', pathMatch: 'full' },
    { path: 'claims-officer/history', redirectTo: 'claims/history', pathMatch: 'full' },

    { path: 'underwriter/dashboard', loadComponent: () => import('./features/underwriter/components/dashboard/underwriter-dashboard.component').then((m) => m.UnderwriterDashboardComponent), canActivate: [authGuard], data: { role: 'UNDERWRITER' } },
    { path: 'underwriter/orders',    loadComponent: () => import('./features/underwriter/components/orders/underwriter-orders.component').then((m) => m.UnderwriterOrdersComponent),       canActivate: [authGuard], data: { role: 'UNDERWRITER' } },
    { path: 'underwriter/review',    loadComponent: () => import('./features/underwriter/components/review/underwriter-review.component').then((m) => m.UnderwriterReviewComponent),       canActivate: [authGuard], data: { role: 'UNDERWRITER' } },
    { path: 'underwriter/policies',  loadComponent: () => import('./features/underwriter/components/policies/underwriter-policies.component').then((m) => m.UnderwriterPoliciesComponent), canActivate: [authGuard], data: { role: 'UNDERWRITER' } },
    { path: 'underwriter/statistics', loadComponent: () => import('./features/admin/components/statistics/statistics.component').then((m) => m.StatisticsComponent), canActivate: [authGuard], data: { role: 'UNDERWRITER' } },

    { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent), canActivate: [authGuard] },

    { path: '**', redirectTo: '' }
];
