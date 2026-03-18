import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardSummary, RiskDistribution, MonthlyRevenue } from '../../../../core/models/models';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, StatCardComponent, NavbarComponent, SidebarComponent, LoadingSpinnerComponent],
    templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
    summary: DashboardSummary | null = null;
    riskDist: RiskDistribution | null = null;
    monthlyRevenue: MonthlyRevenue[] = [];
    loading = true;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadDashboard();
    }

    loadDashboard(): void {
        this.loading = true;
        this.adminService.getDashboardSummary().subscribe({
            next: (data) => { this.summary = data; this.loading = false; },
            error: () => { this.loading = false; this.setMockData(); }
        });
        this.adminService.getRiskDistribution().subscribe({
            next: (data) => this.riskDist = data,
            error: () => this.riskDist = { low: 60, medium: 30, high: 10 }
        });
        this.adminService.getMonthlyRevenue().subscribe({
            next: (data) => this.monthlyRevenue = data,
            error: () => { }
        });
    }

    private setMockData(): void {
        this.summary = { totalUsers: 0, totalPolicies: 0, totalSubscriptions: 0, totalClaims: 0, pendingOrders: 0, monthlyRevenue: 0, activeSubscriptions: 0 };
    }

    get riskPercentage(): { low: number; med: number; high: number } {
        if (!this.riskDist) return { low: 0, med: 0, high: 0 };
        const total = (this.riskDist.low + this.riskDist.medium + this.riskDist.high) || 1;
        return {
            low: Math.round((this.riskDist.low / total) * 100),
            med: Math.round((this.riskDist.medium / total) * 100),
            high: Math.round((this.riskDist.high / total) * 100)
        };
    }
}
