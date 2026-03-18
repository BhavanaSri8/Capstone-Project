import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PolicySubscription, VehicleResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-customer-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, ModalComponent, FormsModule],
  templateUrl: './customer-subscriptions.component.html',
})
export class CustomerSubscriptionsComponent implements OnInit {
  subscriptions: PolicySubscription[] = [];
  availableVehicles: VehicleResponse[] = [];
  userVehicles: VehicleResponse[] = [];
  loading = false;
  showModal = false;
  submitting = false;
  selectedSub: PolicySubscription | null = null;
  linkVehicleNotice = '';
  linkForm!: FormGroup;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
  userId: number;
  
  page = 0;
  totalPages = 0;
  search = '';
  status = 'All';
  private searchSubject = new Subject<string>();

  constructor(
    private subService: SubscriptionService,
    private vehicleService: VehicleService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userId = this.authService.getUserId() ?? 0;
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadSubscriptions();
    });
  }

  ngOnInit(): void {
    this.linkForm = this.fb.group({ vehicleId: ['', Validators.required] });
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    if (!this.userId) return;
    this.loading = true;
    
    this.subService.getUserSubscriptions(this.userId, this.page, 4, this.search, this.status).subscribe({
      next: (res: any) => {
        const subs = res.content || res;
        this.totalPages = res.totalPages || 0;
        
        if (!Array.isArray(subs) || subs.length === 0) {
          this.subscriptions = [];
          this.loading = false;
          return;
        }

        // We still need to load vehicles for these subscriptions manually if not enriched
        // But let's check if they are already enriched
        const vehicleRequests = subs.map((sub: PolicySubscription) => {
           return this.vehicleService.getSubscriptionVehicleDetails(sub.subscriptionId).pipe(
            map(vehicleResponses => ({
              ...sub,
              vehicles: vehicleResponses
            })),
            catchError(() => of({ ...sub, vehicles: [] }))
          )
        });

        forkJoin(vehicleRequests).subscribe({
          next: (subsWithVehicles) => {
            this.subscriptions = subsWithVehicles as PolicySubscription[];
            this.loading = false;
          },
          error: () => {
            this.subscriptions = subs;
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.search);
  }

  onFilter(): void {
    this.page = 0;
    this.loadSubscriptions();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadSubscriptions(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadSubscriptions(); } }

  openLinkVehicle(sub: PolicySubscription): void {
    this.selectedSub = sub;
    this.linkVehicleNotice = '';
    this.linkForm.reset();
    this.vehicleService.getVehicles(0, 50).subscribe({
      next: (res) => {
        const linkedVehicleIds = this.getSubscriptionVehicleIds(sub);
        const blockedVehicleIds = this.getBlockedVehicleIdsForPolicy(sub);

        if (blockedVehicleIds.length > 0) {
          this.linkVehicleNotice = 'Vehicles already covered by an active subscription for this policy cannot be linked again.';
        }

        this.availableVehicles = res.content.filter((v: any) => 
          v.status === 'ACTIVE'
            && !linkedVehicleIds.includes(v.vehicleId)
            && !blockedVehicleIds.includes(v.vehicleId)
        );
        this.showModal = true;
      }
    });
  }

  onLinkSubmit(): void {
    if (this.linkForm.invalid || !this.selectedSub) {
      this.linkForm.markAllAsTouched();
      return;
    }

    const vehicleId = Number(this.linkForm.value.vehicleId);
    if (!this.canLinkVehicleToSelectedSubscription(vehicleId)) {
      this.showToast('error', 'This vehicle already has an active subscription for this policy.');
      return;
    }

    this.submitting = true;
    this.vehicleService.assignVehicleToSubscription(this.selectedSub.subscriptionId, vehicleId).subscribe({
      next: () => {
        this.submitting = false;
        this.showToast('success', 'Vehicle successfully linked to coverage.');
        const selectedVehicle = this.availableVehicles.find(v => v.vehicleId === vehicleId);
        if (selectedVehicle && this.selectedSub) {
          if (!this.selectedSub.vehicles) {
            this.selectedSub.vehicles = [];
          }
          this.selectedSub.vehicles.push({
            vehicleId: selectedVehicle.vehicleId,
            vehicleNumber: selectedVehicle.vehicleNumber,
            vehicleType: selectedVehicle.vehicleType as any,
            vehicleAge: selectedVehicle.vehicleAge,
            registrationDate: selectedVehicle.registrationDate,
            status: selectedVehicle.status as any
          });
        }
        setTimeout(() => {
          this.showModal = false;
          this.loadSubscriptions();
        }, 500);
      },
      error: (err: any) => {
        this.submitting = false;
        this.showToast('error', err.error?.message || 'Failed to link vehicle');
      }
    });
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toastAlert?.nativeElement?.focus());
    setTimeout(() => this.toast = null, 4000);
  }

  private canLinkVehicleToSelectedSubscription(vehicleId: number): boolean {
    if (!this.selectedSub) {
      return false;
    }

    return !this.getBlockedVehicleIdsForPolicy(this.selectedSub).includes(vehicleId);
  }

  private getBlockedVehicleIdsForPolicy(subscription: PolicySubscription): number[] {
    const selectedPolicyId = this.getPolicyId(subscription);
    if (!selectedPolicyId) {
      return [];
    }

    return this.subscriptions
      .filter((existingSubscription) =>
        existingSubscription.subscriptionId !== subscription.subscriptionId
        && existingSubscription.subscriptionStatus === 'ACTIVE'
        && this.getPolicyId(existingSubscription) === selectedPolicyId
      )
      .flatMap((existingSubscription) => this.getSubscriptionVehicleIds(existingSubscription));
  }

  private getSubscriptionVehicleIds(subscription: PolicySubscription): number[] {
    const ids = new Set<number>();

    (subscription.vehicles || []).forEach((vehicle) => {
      if (typeof vehicle?.vehicleId === 'number') {
        ids.add(vehicle.vehicleId);
      }
    });

    const legacyVehicleId = (subscription as any).vehicleId
      ?? (subscription as any).vehicle?.vehicleId
      ?? (subscription as any).order?.vehicleId
      ?? (subscription as any).order?.vehicle?.vehicleId;

    if (typeof legacyVehicleId === 'number') {
      ids.add(legacyVehicleId);
    }

    return Array.from(ids);
  }

  private getPolicyId(subscription: PolicySubscription): number | undefined {
    return subscription.order?.policy?.policyId ?? subscription.policy?.policyId;
  }
}
