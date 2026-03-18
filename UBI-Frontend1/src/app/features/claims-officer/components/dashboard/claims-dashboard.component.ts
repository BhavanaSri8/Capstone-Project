import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimsOfficerService } from '../../services/claims-officer.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { Claim } from '../../../../core/models/models';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-claims-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, StatCardComponent, SkeletonLoaderComponent],
  templateUrl: './claims-dashboard.component.html',
})
export class ClaimsDashboardComponent implements OnInit {
  claims: any[] = [];
  pendingClaims: any[] = [];
  processedClaims: any[] = [];
  loading = false;
  submittingId: number | null = null;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;

  processedToday = 0;
  totalSettled = 0;

  constructor(
    private assessorService: ClaimsOfficerService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService
  ) { }

  ngOnInit(): void { this.loadClaims(); }

  loadClaims(): void {
    this.loading = true;
    this.assessorService.getAllClaims().subscribe({
      next: (response: any) => {
        console.log('📋 All claims loaded:', response);
        const data = response.content || response;
        
        if (!data || !Array.isArray(data)) {
          this.claims = [];
          this.loading = false;
          return;
        }
        
        console.log('⏳ PENDING claims:', data.filter(c => c.claimStatus === 'PENDING'));
        console.log('✅ APPROVED claims:', data.filter(c => c.claimStatus === 'APPROVED'));
        console.log('❌ REJECTED claims:', data.filter(c => c.claimStatus === 'REJECTED'));
        
        this.claims = data.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
        this.pendingClaims = this.claims.filter(c => c.claimStatus === 'PENDING');
        this.processedClaims = this.claims.filter(c => c.claimStatus !== 'PENDING');
        const allClaimsToEnrich = [...this.pendingClaims, ...this.processedClaims];
        
        if (allClaimsToEnrich.length > 0) {
          const requests = allClaimsToEnrich.map((claim: any) =>
            this.subscriptionService.getSubscriptionById(claim.subscriptionId).pipe(
              map(sub => ({
                ...claim,
                customerName: sub?.order?.user?.fullName || 'Unknown',
                subscription: sub
              }))
            )
          );
          
          forkJoin(requests).subscribe({
            next: (enrichedClaims) => {
              this.pendingClaims = (enrichedClaims as any[]).filter(c => c.claimStatus === 'PENDING');
              this.processedClaims = (enrichedClaims as any[]).filter(c => c.claimStatus !== 'PENDING');
              this.calculateStats();
              this.loading = false;
            },
            error: () => {
              this.calculateStats();
              this.loading = false;
            }
          });
        } else {
          this.calculateStats();
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Failed to load claims:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    const today = new Date().toDateString();
    const todayProcessed = this.processedClaims.filter(c => new Date(c.submittedDate).toDateString() === today);
    this.processedToday = this.processedClaims.length;

    this.totalSettled = this.processedClaims
      .filter(c => c.claimStatus === 'APPROVED')
      .reduce((sum, current) => sum + current.claimAmount, 0);
  }

  approve(claim: Claim): void {
    this.submittingId = claim.claimId;
    this.assessorService.approveClaim(claim.claimId).subscribe({
      next: () => {
        this.showToast('success', `Claim #${claim.claimId} approved for payment.`);
        this.submittingId = null;
        this.loadClaims();
      },
      error: (err) => {
        this.submittingId = null;
        if (err.status === 409) {
          this.showToast('error', `This claim was already processed by another officer. Refreshing...`);
          setTimeout(() => this.loadClaims(), 2000);
        } else {
          this.showToast('error', err.error?.message || `Failed to approve claim #${claim.claimId}`);
        }
      }
    });
  }

  reject(claim: Claim): void {
    this.submittingId = claim.claimId;
    this.assessorService.rejectClaim(claim.claimId).subscribe({
      next: () => {
        this.showToast('success', `Claim #${claim.claimId} rejected.`);
        this.submittingId = null;
        this.loadClaims();
      },
      error: (err) => {
        this.submittingId = null;
        if (err.status === 409) {
          this.showToast('error', `This claim was already processed by another officer. Refreshing...`);
          setTimeout(() => this.loadClaims(), 2000);
        } else {
          this.showToast('error', err.error?.message || `Failed to reject claim #${claim.claimId}`);
        }
      }
    });
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toastAlert?.nativeElement?.focus());
    setTimeout(() => this.toast = null, 3000);
  }
}
