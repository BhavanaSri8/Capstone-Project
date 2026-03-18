import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PolicyService } from '../../../../shared/services/policy.service';
import { OrderService } from '../../../../shared/services/order.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PolicyResponse, PolicySubscription, VehicleResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-customer-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, ModalComponent],
  templateUrl: './customer-policies.component.html',
})
export class CustomerPoliciesComponent implements OnInit {
  policies: PolicyResponse[] = [];
  subscriptions: PolicySubscription[] = [];
  vehicles: VehicleResponse[] = [];
  loading = false;
  ordering: number | null = null;
  renewingSubscriptionId: number | null = null;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
  userId: number;
  showDetailsModal = false;
  selectedPolicy: PolicyResponse | null = null;
  selectedApplyVehicleId: number | null = null;
  
  allPolicies: PolicyResponse[] = [];
  search = '';
  page = 0;
  totalPages = 0;
  private searchSubject = new Subject<string>();

  // Document upload modal
  showDocumentModal = false;
  pendingPolicyId: number | null = null;
  pendingVehicleId: number | null = null;
  selectedDocuments: File[] = [];
  documentError = '';
  uploadingDocuments = false;
  private readonly allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png']);
  private readonly maxFileSizeBytes = 5 * 1024 * 1024;

  constructor(
    private policyService: PolicyService,
    private orderService: OrderService,
    private subscriptionService: SubscriptionService,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {
    this.userId = this.authService.getUserId() ?? 0;
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadPolicies();
    });
  }

  ngOnInit(): void { this.loadData(); }

  loadPolicies(): void {
    this.loading = true;
    this.policyService.getAllPolicies(this.page, 10, this.search, true).subscribe({
      next: (res) => {
        this.policies = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      policiesRes: this.policyService.getAllPolicies(0, 10, this.search, true),
      subscriptionsRes: this.userId
        ? this.subscriptionService.getUserSubscriptions(this.userId, 0, 100)
        : of({ content: [] }),
      vehiclePage: this.vehicleService.getVehicles(0, 100)
    }).subscribe({
      next: ({ policiesRes, subscriptionsRes, vehiclePage }) => {
        this.policies = policiesRes.content;
        this.totalPages = policiesRes.totalPages;
        this.vehicles = (vehiclePage as any).content ?? [];
        
        const subscriptions = subscriptionsRes.content || [];

        if (subscriptions.length === 0) {
          this.subscriptions = [];
          this.loading = false;
          return;
        }

        // Enrich each subscription with its linked vehicle details
        const enrichCalls = subscriptions.map((sub: any) =>
          this.vehicleService.getSubscriptionVehicleDetails(sub.subscriptionId).pipe(
            map((vDetails: VehicleResponse[]) => ({
              ...sub,
              vehicles: vDetails.length > 0 ? vDetails as any[] : (sub.vehicles ?? [])
            })),
            catchError(() => of({ ...sub, vehicles: sub.vehicles ?? [] }))
          )
        );

        forkJoin(enrichCalls).subscribe({
          next: (enriched) => {
            this.subscriptions = enriched as PolicySubscription[];
            this.loading = false;
          },
          error: () => {
            this.subscriptions = subscriptions;
            this.loading = false;
          }
        });
      },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.search);
  }

  clearFilters(): void {
    this.search = '';
    this.page = 0;
    this.loadPolicies();
  }

  viewPolicyDetails(policy: PolicyResponse): void {
    this.selectedPolicy = policy;
    this.selectedApplyVehicleId = null;
    this.showDetailsModal = true;
  }

  getTotalPremium(policy: PolicyResponse): number {
    const years = policy.policyTermYears || 5;
    return policy.basePremium * 12 * years;
  }

  applyFromModal(): void {
    if (!this.selectedPolicy) return;

    const action = this.getModalPolicyAction(this.selectedPolicy.policyId);

    if (action === 'no-vehicle') {
      this.showToast('error', 'Please select a vehicle to check coverage before applying.');
      return;
    }

    if (action === 'active') {
      this.showToast('error', 'This vehicle already has an active subscription for this policy.');
      return;
    }

    if (action === 'renew') {
      const expiredSub = this.getExpiredSubscriptionForVehicle(
        this.selectedPolicy.policyId, this.selectedApplyVehicleId
      );
      if (!expiredSub) {
        this.showToast('error', 'Unable to find the expired subscription to renew.');
        return;
      }
      this.showDetailsModal = false;
      this.renewPolicy(expiredSub.subscriptionId);
      return;
    }

    if (!this.selectedApplyVehicleId) {
      this.showToast('error', 'Please select a vehicle to apply for this policy.');
      return;
    }

    this.showDetailsModal = false;
    this.showDocumentUploadModal(this.selectedPolicy.policyId, this.selectedApplyVehicleId);
  }

  /**
   * Vehicle-aware action for the details modal.
   * Returns 'no-vehicle' when the customer owns vehicles but hasn't selected one yet.
   */
  getModalPolicyAction(policyId: number): 'apply' | 'renew' | 'active' | 'no-vehicle' {
    if (this.selectedApplyVehicleId == null) {
      return 'no-vehicle';
    }
    if (this.hasActiveSubscriptionForVehicle(policyId, this.selectedApplyVehicleId)) {
      return 'active';
    }
    return this.getExpiredSubscriptionForVehicle(policyId, this.selectedApplyVehicleId) ? 'renew' : 'apply';
  }

  /** Card-level: whether any subscription exists for this policy (informational only, not blocking). */
  getCardCoverageStatus(policyId: number): 'active' | 'expired' | 'none' {
    const subs = this.getPolicySubscriptions(policyId);
    if (subs.some(s => s.subscriptionStatus === 'ACTIVE')) return 'active';
    if (subs.some(s => s.subscriptionStatus === 'EXPIRED')) return 'expired';
    return 'none';
  }

  showDocumentUploadModal(policyId: number, vehicleId: number | null): void {
    this.pendingPolicyId = policyId;
    this.pendingVehicleId = vehicleId;
    this.selectedDocuments = [];
    this.documentError = '';
    this.showDocumentModal = true;
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

  submitPolicyApplicationWithDocuments(): void {
    if (!this.pendingPolicyId || !this.userId) return;
    if (!this.pendingVehicleId) {
      this.documentError = 'Please select a vehicle before submitting your application.';
      return;
    }
    if (this.selectedDocuments.length === 0) {
      this.documentError = 'Please upload all 4 required documents.';
      return;
    }
    if (this.documentError) {
      return;
    }

    this.uploadingDocuments = true;

    const formData = new FormData();
    formData.append('userId', this.userId.toString());
    formData.append('policyId', this.pendingPolicyId.toString());
    formData.append('vehicleId', this.pendingVehicleId.toString());
    
    this.selectedDocuments.forEach((file, index) => {
      formData.append('documents', file);
    });

    this.orderService.createPolicyOrderWithDocuments(formData).subscribe({
      next: () => {
        this.uploadingDocuments = false;
        this.showDocumentModal = false;
        this.selectedDocuments = [];
        this.documentError = '';
        this.pendingPolicyId = null;
        this.pendingVehicleId = null;
        this.showToast('success', 'Application submitted! Pending underwriter approval.');
        this.loadData();
      },
      error: (err) => {
        this.uploadingDocuments = false;
        this.showToast('error', err.error?.message || 'Failed to submit application');
      }
    });
  }

  orderPolicy(policyId: number): void {
    if (!this.userId || !this.selectedApplyVehicleId) return;
    this.ordering = policyId;
    this.orderService.createOrder(this.userId, policyId, this.selectedApplyVehicleId).subscribe({
      next: () => {
        this.ordering = null;
        this.showDetailsModal = false;
        this.showToast('success', 'Application submitted! Pending underwriter approval.');
      },
      error: (err) => {
        this.ordering = null;
        this.showToast('error', err.error?.message || 'Failed to apply');
      }
    });
  }

  getPrimaryActionLabel(policyId: number): string {
    const action = this.getModalPolicyAction(policyId);
    if (action === 'active') return 'Already Active';
    if (action === 'renew') return 'Renew Policy';
    if (action === 'no-vehicle') return 'Select a Vehicle First';
    return 'Apply Now';
  }

  getStatusMessage(policyId: number): string | null {
    const action = this.getModalPolicyAction(policyId);
    if (action === 'active') {
      return 'This vehicle already has an active subscription for this policy. Duplicate applications are not allowed.';
    }
    if (action === 'renew') {
      return 'Your subscription for this vehicle has expired. Renew it to restore coverage without a new application.';
    }
    return null;
  }

  isPrimaryActionDisabled(policyId: number): boolean {
    const action = this.getModalPolicyAction(policyId);
    return action === 'active' || action === 'no-vehicle';
  }

  private hasActiveSubscriptionForVehicle(policyId: number, vehicleId: number | null): boolean {
    if (vehicleId == null) return false;
    return this.subscriptions.some(sub =>
      this.getSubscriptionPolicyId(sub) === policyId &&
      sub.subscriptionStatus === 'ACTIVE' &&
      this.getSubscriptionVehicleIds(sub).includes(vehicleId)
    );
  }

  private getExpiredSubscriptionForVehicle(policyId: number, vehicleId: number | null): PolicySubscription | null {
    if (vehicleId == null) return null;
    const expired = this.subscriptions
      .filter(sub =>
        this.getSubscriptionPolicyId(sub) === policyId &&
        sub.subscriptionStatus === 'EXPIRED' &&
        this.getSubscriptionVehicleIds(sub).includes(vehicleId)
      )
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    return expired[0] ?? null;
  }

  private getSubscriptionVehicleIds(subscription: PolicySubscription): number[] {
    const ids = new Set<number>();
    (subscription.vehicles ?? []).forEach((vehicle: any) => {
      if (typeof vehicle?.vehicleId === 'number') {
        ids.add(vehicle.vehicleId);
      }
    });

    // Backward compatibility for any legacy payload shape
    const legacyVehicleId = (subscription as any).vehicleId ?? (subscription as any).vehicle?.vehicleId;
    if (typeof legacyVehicleId === 'number') {
      ids.add(legacyVehicleId);
    }

    return Array.from(ids);
  }

  private getPolicySubscriptions(policyId: number): PolicySubscription[] {
    return this.subscriptions.filter(sub => this.getSubscriptionPolicyId(sub) === policyId);
  }

  private getSubscriptionPolicyId(subscription: PolicySubscription): number | undefined {
    return subscription.order?.policy?.policyId ?? subscription.policy?.policyId;
  }

  private renewPolicy(subscriptionId: number): void {
    this.renewingSubscriptionId = subscriptionId;
    this.subscriptionService.renewSubscription(subscriptionId).subscribe({
      next: () => {
        this.renewingSubscriptionId = null;
        this.showToast('success', 'Renewal request submitted successfully.');
        this.loadData();
      },
      error: (err) => {
        this.renewingSubscriptionId = null;
        this.showToast('error', err.error?.message || 'Failed to submit renewal request');
      }
    });
  }

  private showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toastAlert?.nativeElement?.focus());
    setTimeout(() => this.toast = null, 4000);
  }
}
