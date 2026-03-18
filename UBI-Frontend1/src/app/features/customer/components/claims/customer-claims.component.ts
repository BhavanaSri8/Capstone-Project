import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/claim.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Claim, ClaimRequest, PolicySubscription, ClaimStatus } from '../../../../core/models/models';

@Component({
  selector: 'app-customer-claims',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, ModalComponent],
  templateUrl: './customer-claims.component.html'
})
export class CustomerClaimsComponent implements OnInit {
  claims: Claim[] = [];
  activeSubs: PolicySubscription[] = [];
  loading = false;
  showModal = false;
  submitting = false;
  claimForm!: FormGroup;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
  userId: number;
  selectedDocuments: File[] = [];
  documentError = '';
  search = '';
  status: string = 'All';
  private readonly allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png']);

  get filteredClaims(): Claim[] {
    return this.claims.filter(c => {
      const matchSearch = !this.search || 
        c.claimId.toString().includes(this.search) || 
        c.claimReason.toLowerCase().includes(this.search.toLowerCase()) ||
        c.subscription?.order?.policy?.policyName.toLowerCase().includes(this.search.toLowerCase());
      const matchStatus = this.status === 'All' || c.claimStatus === this.status;
      return matchSearch && matchStatus;
    });
  }
  private readonly maxFileSizeBytes = 5 * 1024 * 1024;

  constructor(
    private claimService: ClaimService,
    private subService: SubscriptionService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userId = this.authService.getUserId() ?? 0;
  }

  ngOnInit(): void {
    this.claimForm = this.fb.group({
      subscriptionId: ['', Validators.required],
      claimAmount: ['', [Validators.required, Validators.min(1), Validators.max(10000000)]],
      claimReason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
    this.loadData();
  }

  loadData(): void {
    if (!this.userId) return;
    this.loading = true;
    this.subService.getUserSubscriptions(this.userId).subscribe({
      next: (res: any) => {
        const subs = res.content || res;
        this.activeSubs = subs.filter((s: any) => s.subscriptionStatus === 'ACTIVE');
        this.fetchAllClaims();
      },
      error: () => this.loading = false
    });
  }

  fetchAllClaims(): void {
    this.claims = [];
    if (this.activeSubs.length === 0) {
      this.loading = false;
      return;
    }

    let processed = 0;
    this.activeSubs.forEach(sub => {
      this.claimService.getClaimsBySubscription(sub.subscriptionId).subscribe({
        next: (res: any) => {
          const subClaims = res.content || res;
          const mappedClaims: Claim[] = subClaims.map((c: any) => ({
            ...c,
            subscription: sub,
            claimStatus: c.claimStatus as ClaimStatus
          }));
          this.claims = [...this.claims, ...mappedClaims];
          processed++;
          if (processed === this.activeSubs.length) {
            this.claims.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
            this.loading = false;
          }
        },
        error: () => {
          processed++;
          if (processed === this.activeSubs.length) this.loading = false;
        }
      });
    });
  }

  openCreate(): void {
    this.claimForm.reset();
    this.selectedDocuments = [];
    this.documentError = '';
    if (this.activeSubs.length === 1) {
      this.claimForm.patchValue({ subscriptionId: this.activeSubs[0].subscriptionId });
    }
    this.showModal = true;
  }

  onDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.documentError = '';
    this.selectedDocuments = [];

    if (files.length === 0) {
      return;
    }

    const invalid = files.find((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      return !this.allowedExtensions.has(ext) || file.size > this.maxFileSizeBytes;
    });

    if (invalid) {
      const ext = invalid.name.split('.').pop()?.toLowerCase() ?? '';
      if (!this.allowedExtensions.has(ext)) {
        this.documentError = `Unsupported file format: ${invalid.name}. Allowed formats are PDF, JPG, JPEG, PNG.`;
      } else {
        this.documentError = `File too large: ${invalid.name}. Maximum allowed size is 5 MB per file.`;
      }
      input.value = '';
      return;
    }

    this.selectedDocuments = files;
  }

  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  onSubmit(): void {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }
    if (this.selectedDocuments.length === 0) {
      this.documentError = 'Please upload at least one supporting document.';
      return;
    }
    if (this.documentError) {
      return;
    }

    this.submitting = true;

    const req: ClaimRequest = {
      subscriptionId: parseInt(this.claimForm.value.subscriptionId),
      claimAmount: this.claimForm.value.claimAmount,
      claimReason: this.claimForm.value.claimReason
    };

    this.claimService.createClaimWithDocuments(req, this.selectedDocuments).subscribe({
      next: () => {
        this.submitting = false;
        this.showModal = false;
        this.selectedDocuments = [];
        this.documentError = '';
        this.showToast('success', 'Claim submitted successfully. A claims officer will review it shortly.');
        this.fetchAllClaims();
      },
      error: (err) => {
        this.submitting = false;
        this.showToast('error', err.error?.message || 'Failed to submit claim');
      }
    });
  }

  clearFilters(): void {
    this.search = '';
    this.status = 'All';
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toastAlert?.nativeElement?.focus());
    setTimeout(() => this.toast = null, 4000);
  }
}
