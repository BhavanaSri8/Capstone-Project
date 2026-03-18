import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { UnderwriterService, UnderwriterDashboard, UnderwriterApplication } from '../../services/underwriter.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-underwriter-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, StatCardComponent, SkeletonLoaderComponent, RouterLink],
  templateUrl: './underwriter-dashboard.component.html',
})
export class UnderwriterDashboardComponent implements OnInit {
  stats: UnderwriterDashboard | null = null;
  pendingApplications: UnderwriterApplication[] = [];
  loading = true;
  submittingId: number | null = null;
  toast: { type: 'success' | 'error'; message: string } | null = null;

  constructor(private underwriterService: UnderwriterService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.underwriterService.getDashboard().subscribe({
      next: (stats) => { this.stats = stats; },
      error: () => {}
    });
    this.underwriterService.getPendingApplications().subscribe({
      next: (apps) => {
        this.pendingApplications = apps;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  approve(app: UnderwriterApplication): void {
    const remarks = prompt('Approval remarks (optional):') ?? undefined;
    this.submittingId = app.orderId;
    this.underwriterService.approvePolicy(app.orderId, remarks).subscribe({
      next: () => {
        this.submittingId = null;
        this.showToast('success', `Application #${app.orderId} approved.`);
        this.loadData();
      },
      error: (err) => {
        this.submittingId = null;
        this.showToast('error', err.error?.message || 'Approval failed.');
      }
    });
  }

  reject(app: UnderwriterApplication): void {
    const remarks = prompt('Rejection reason (required):');
    if (!remarks) return;
    this.submittingId = app.orderId;
    this.underwriterService.rejectPolicy(app.orderId, remarks).subscribe({
      next: () => {
        this.submittingId = null;
        this.showToast('success', `Application #${app.orderId} rejected.`);
        this.loadData();
      },
      error: (err) => {
        this.submittingId = null;
        this.showToast('error', err.error?.message || 'Rejection failed.');
      }
    });
  }

  requestDocs(app: UnderwriterApplication): void {
    const remarks = prompt('Specify required documents:');
    if (!remarks) return;
    this.submittingId = app.orderId;
    this.underwriterService.requestDocuments(app.orderId, remarks).subscribe({
      next: () => {
        this.submittingId = null;
        this.showToast('success', `Document request sent for Application #${app.orderId}.`);
        this.loadData();
      },
      error: (err) => {
        this.submittingId = null;
        this.showToast('error', err.error?.message || 'Request failed.');
      }
    });
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toast = null, 4000);
  }
}
