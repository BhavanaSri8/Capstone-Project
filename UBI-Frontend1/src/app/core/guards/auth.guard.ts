import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleType } from '../../../models/role.model';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('driveiq_user');

    if (!token || !userStr) {
        router.navigate(['/login']);
        return false;
    }

    const user = JSON.parse(userStr);
    const requiredRole = route.data?.['role'] as RoleType | undefined;

    if (requiredRole && user.role !== requiredRole) {
        const roleRedirects: Record<RoleType, string> = {
            'ADMIN': '/admin/dashboard',
            'CUSTOMER': '/customer/dashboard',
            'CLAIMS_OFFICER': '/claims/dashboard',
            'UNDERWRITER': '/underwriter/dashboard'
        };
        const redirectPath = roleRedirects[user.role as RoleType] || '/login';
        router.navigate([redirectPath]);
        return false;
    }

    return true;
};
