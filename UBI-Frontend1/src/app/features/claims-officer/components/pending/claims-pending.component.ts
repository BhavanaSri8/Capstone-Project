import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ClaimsOfficerService } from '../../services/claims-officer.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Claim } from '../../../../core/models/models';
import { forkJoin, debounceTime, Subject, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-claims-pending',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, FormsModule],
  templateUrl: './claims-pending.component.html',
})
export class ClaimsPendingComponent implements OnInit {
  pendingClaims: any[] = [];
  loading = false;
  submittingId: number | null = null;
  downloadingDoc: string | null = null;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
  viewingDocClaimId: number | null = null;
  viewingDocName: string | null = null;
  viewingDocUrl: { type: string; data: string | ArrayBuffer | SafeResourceUrl } | null = null;
  showViewModal = false;

  page = 0;
  totalPages = 0;
  search = '';
  status = 'PENDING';
  private searchSubject = new Subject<string>();

  constructor(
    private claimsOfficerService: ClaimsOfficerService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadClaims();
    });
  }

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
    this.claimsOfficerService.getAllClaims(this.page, 5, this.search, this.status).subscribe({
      next: (res) => {
        this.pendingClaims = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showToast('error', 'Failed to load claims');
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.search);
  }

  onFilter(): void {
    this.page = 0;
    this.loadClaims();
  }

  clearFilters(): void {
    this.search = '';
    this.status = 'PENDING';
    this.page = 0;
    this.loadClaims();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadClaims(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadClaims(); } }

  refreshClaims(): void {
    this.loadClaims();
  }

  approve(claim: any): void {
    this.submittingId = claim.claimId;
    this.claimsOfficerService.approveClaim(claim.claimId).subscribe({
      next: () => {
        this.submittingId = null;
        this.showToast('success', `Claim #${claim.claimId} approved for ₹${claim.claimAmount}`);
        this.pendingClaims = this.pendingClaims.filter(c => c.claimId !== claim.claimId);
      },
      error: (err) => {
        this.submittingId = null;
        if (err.status === 409) {
          this.showToast('error', 'This claim was already processed by another officer. Refreshing...');
          this.pendingClaims = this.pendingClaims.filter(c => c.claimId !== claim.claimId);
          setTimeout(() => this.loadClaims(), 2000);
        } else {
          this.showToast('error', err.error?.message || 'Failed to approve claim');
        }
      }
    });
  }

  reject(claim: any): void {
    this.submittingId = claim.claimId;
    this.claimsOfficerService.rejectClaim(claim.claimId).subscribe({
      next: () => {
        this.submittingId = null;
        this.showToast('success', `Claim #${claim.claimId} rejected`);
        this.pendingClaims = this.pendingClaims.filter(c => c.claimId !== claim.claimId);
      },
      error: (err) => {
        this.submittingId = null;
        if (err.status === 409) {
          this.showToast('error', 'This claim was already processed by another officer. Refreshing...');
          this.pendingClaims = this.pendingClaims.filter(c => c.claimId !== claim.claimId);
          setTimeout(() => this.loadClaims(), 2000);
        } else {
          this.showToast('error', err.error?.message || 'Failed to reject claim');
        }
      }
    });
  }

  daysPending(submittedDate: string): number {
    return Math.floor((new Date().getTime() - new Date(submittedDate).getTime()) / (1000 * 60 * 60 * 24));
  }

  downloadDocument(claimId: number, documentName: string): void {
    this.downloadingDoc = documentName;
    this.claimsOfficerService.downloadDocument(claimId, documentName).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documentName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingDoc = null;
      },
      error: (err) => {
        this.downloadingDoc = null;
        this.showToast('error', `Failed to download ${documentName}`);
      }
    });
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toastAlert?.nativeElement?.focus());
    setTimeout(() => this.toast = null, 4000);
  }

  viewDocument(claimId: number, documentName: string): void {
    this.viewingDocClaimId = claimId;
    this.viewingDocName = documentName;
    
    this.claimsOfficerService.downloadDocument(claimId, documentName).subscribe({
      next: (blob: Blob) => {
        const ext = documentName.split('.').pop()?.toLowerCase() || '';
        const fileType = ext === 'pdf' ? 'pdf' : ext.match(/jpg|jpeg|png/) ? 'image' : 'file';
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result || '';
          const safeUrl = fileType === 'pdf' ? this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl as string) : dataUrl;
          this.viewingDocUrl = { type: fileType, data: safeUrl };
          this.showViewModal = true;
        };
        reader.readAsDataURL(blob);
      },
      error: (err: any) => {
        this.showToast('error', `Failed to open ${documentName}`);
        this.viewingDocClaimId = null;
        this.viewingDocName = null;
      }
    });
  }
}
