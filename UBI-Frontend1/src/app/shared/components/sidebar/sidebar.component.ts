import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../features/auth/services/auth.service';

interface NavItem {
    label: string;
    route: string;
    icon: string;
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
    @Input() collapsed = false;

    constructor(
        private authService: AuthService,
        private sanitizer: DomSanitizer
    ) { }

    get role(): string { return this.authService.getUserRole() ?? ''; }

    get roleLabel(): string {
        const labels: Record<string, string> = {
            ADMIN: 'Admin',
            CUSTOMER: 'Customer',
            UNDERWRITER: 'Underwriter',
            CLAIMS_OFFICER: 'Claims Officer'
        };
        return labels[this.role] || this.role;
    }

    get navItems(): NavItem[] {
        const maps: Record<string, NavItem[]> = {
            ADMIN: [
                { label: 'Dashboard', route: '/admin/dashboard', icon: 'home' },
                { label: 'Policies', route: '/admin/policies', icon: 'shield' },
                { label: 'Users', route: '/admin/users', icon: 'users' },
                { label: 'Vehicles', route: '/admin/vehicles', icon: 'car' },
                { label: 'Claims', route: '/admin/claims', icon: 'file-text' },
                { label: 'Premium Rules', route: '/admin/rules', icon: 'settings' },
                { label: 'Statistics', route: '/admin/statistics', icon: 'bar-chart' },
                { label: 'Orders (View Only)', route: '/admin/orders', icon: 'clipboard' },
                { label: 'Payment History', route: '/admin/payments', icon: 'archive' }
            ],
            CUSTOMER: [
                { label: 'Dashboard', route: '/customer/dashboard', icon: 'home' },
                { label: 'Policies', route: '/customer/policies', icon: 'shield' },
                { label: 'Vehicles', route: '/customer/vehicles', icon: 'car' },
                { label: 'Subscriptions', route: '/customer/subscriptions', icon: 'credit-card' },
                { label: 'Usage Data', route: '/customer/usage', icon: 'activity' },
                { label: 'Claims', route: '/customer/claims', icon: 'file-text' },
                { label: 'Premiums', route: '/customer/premium', icon: 'dollar-sign' },
                { label: 'Payment History', route: '/customer/payments', icon: 'archive' }
            ],
            CLAIMS_OFFICER: [
                { label: 'Dashboard', route: '/claims/dashboard', icon: 'home' },
                { label: 'Manage Claims', route: '/claims/manage', icon: 'clock' },
                { label: 'Claims History', route: '/claims/history', icon: 'archive' }
            ],
            UNDERWRITER: [
                { label: 'Dashboard', route: '/underwriter/dashboard', icon: 'home' },
                { label: 'Policy Orders', route: '/underwriter/orders', icon: 'clipboard' },
                { label: 'Risk Review', route: '/underwriter/review', icon: 'activity' },
                { label: 'Statistics', route: '/underwriter/statistics', icon: 'bar-chart' }
            ]
        };
        return maps[this.role] || [];
    }

    getIcon(name: string): SafeHtml {
        const svg = (paths: string) =>
            this.sanitizer.bypassSecurityTrustHtml(
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
            );
        const icons: Record<string, SafeHtml> = {
            home:          svg(`<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`),
            shield:        svg(`<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>`),
            clipboard:     svg(`<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>`),
            users:         svg(`<path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>`),
            car:           svg(`<path d="M8 7h8m-8 5h8M5 6a7 7 0 0114 0v4l1 1H4l1-1V6zM4 16h16v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1z"/>`),
            'file-text':   svg(`<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`),
            settings:      svg(`<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`),
            'credit-card': svg(`<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>`),
            activity:      svg(`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`),
            'dollar-sign': svg(`<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>`),
            clock:         svg(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`),
            archive:       svg(`<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>`),
            'bar-chart':   svg(`<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`)
        };
        return icons[name] || icons['home'];
    }
}
