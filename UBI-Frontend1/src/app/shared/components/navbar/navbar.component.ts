import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { AuthResponse } from '../../../core/models/models';
import { interval, Subscription } from 'rxjs';
import { ROLE_LABELS, RoleType } from '../../../../models/role.model';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, NotificationsComponent],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
    currentUser: AuthResponse | null = null;
    showUserMenu = false;
    currentTime = new Date();
    private timerSub?: Subscription;

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.timerSub = interval(60000).subscribe(() => this.currentTime = new Date());
    }

    ngOnDestroy(): void {
        this.timerSub?.unsubscribe();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    get dashboardRoute(): string {
        const routes: Record<RoleType, string> = {
            'ADMIN': '/admin/dashboard',
            'CUSTOMER': '/customer/dashboard',
            'CLAIMS_OFFICER': '/claims/dashboard',
            'UNDERWRITER': '/underwriter/dashboard'
        };
        return routes[this.currentUser?.role as RoleType] || '/';
    }

    get roleLabel(): string {
        if (!this.currentUser?.role) {
            return '';
        }
        return ROLE_LABELS[this.currentUser.role as RoleType] || this.currentUser.role;
    }
}
