import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClaimsOfficerService } from '../../services/claims-officer.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { Claim } from '../../../../core/models/models';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-claims-history',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, FormsModule],
  templateUrl: './claims-history.component.html',
})
export class ClaimsHistoryComponent implements OnInit {
  allClaims: any[] = [];
  loading = false;
  page = 0;
  totalPages = 0;
  search = '';
  filterStatus: 'APPROVED' | 'REJECTED' = 'APPROVED';

  constructor(
    private claimsOfficerService: ClaimsOfficerService,
    private subscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    this.loadClaims();
  }

  getCustomerName(claim: any): string {
    return claim.customerName || 'Unknown';
  }

  getPolicyName(claim: any): string {
    return claim.policyName || 'Unknown';
  }

  loadClaims(): void {
    this.loading = true;
    this.claimsOfficerService.getAllClaims(this.page, 10, this.search, this.filterStatus).subscribe({
      next: (response: any) => {
        if (!response || !Array.isArray(response.content)) {
          this.allClaims = [];
          this.totalPages = 0;
          this.loading = false;
          return;
        }
        
        this.totalPages = response.totalPages;
        const claims = response.content;
        const requests = claims.map((claim: any) => 
          this.subscriptionService.getSubscriptionById(claim.subscriptionId).pipe(
            map(sub => ({
              ...claim,
              customerName: sub?.order?.user?.fullName || 'Unknown',
              policyName: sub?.order?.policy?.policyName || 'Unknown',
              subscription: sub
            }))
          )
        );

        if (requests.length === 0) {
          this.allClaims = [];
          this.loading = false;
          return;
        }

        forkJoin(requests).subscribe({
          next: (enrichedClaims: any) => {
            this.allClaims = enrichedClaims as any[];
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to enrich claims:', err);
            this.allClaims = claims;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load claims:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadClaims();
  }

  onStatusChange(status: 'APPROVED' | 'REJECTED'): void {
    this.filterStatus = status;
    this.page = 0;
    this.loadClaims();
  }

  clearFilters(): void {
    this.search = '';
    this.filterStatus = 'APPROVED';
    this.page = 0;
    this.loadClaims();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadClaims(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadClaims(); } }
}
