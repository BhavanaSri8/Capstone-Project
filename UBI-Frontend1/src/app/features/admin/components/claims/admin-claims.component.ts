import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ClaimService } from '../../../../features/customer/services/claim.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component'; // Added ModalComponent import
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-admin-claims',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, ModalComponent, SkeletonLoaderComponent],
    templateUrl: './admin-claims.component.html',
})
export class AdminClaimsComponent implements OnInit {
    claims: any[] = [];
    loading = false;
    toast: { type: 'success' | 'error'; message: string } | null = null;
    @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
    page = 0;
    totalPages = 0;
    search = '';
    status = 'All';

    constructor(
        private claimService: ClaimService,
        private subscriptionService: SubscriptionService,
        private authService: AuthService
    ) { }

    ngOnInit(): void { this.loadClaims(); }

    loadClaims(): void {
        this.loading = true;
        this.claimService.getAllClaims(this.page, 10, this.search, this.status === 'All' ? undefined : this.status).subscribe({
            next: (data: any) => {
                if (data && Array.isArray(data.content)) {
                    this.claims = data.content;
                    this.totalPages = data.totalPages;
                } else {
                    this.claims = [];
                    this.totalPages = 0;
                    this.loading = false;
                    return;
                }
                
                const requests = this.claims.map((claim: any) =>
                    this.subscriptionService.getSubscriptionById(claim.subscriptionId).pipe(
                        map(subscription => ({
                            ...claim,
                            customerName: subscription?.order?.user?.fullName || 'Unknown',
                            subscription: subscription
                        }))
                    )
                );
                
                forkJoin(requests).subscribe({
                    next: (enrichedClaims: any[]) => {
                        this.claims = enrichedClaims;
                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('❌ Failed to enrich claims:', err);
                        this.loading = false;
                    }
                });
            },
            error: (err) => {
                console.error('❌ Failed to load claims:', err);
                this.loading = false;
            }
        });
    }

    approve(claim: any): void {
        this.claimService.approveClaim(claim.claimId).subscribe({
            next: () => { this.showToast('success', 'Claim approved!'); this.loadClaims(); },
            error: () => this.showToast('error', 'Failed to approve claim.')
        });
    }

    reject(claim: any): void {
        this.claimService.rejectClaim(claim.claimId).subscribe({
            next: () => { this.showToast('success', 'Claim rejected.'); this.loadClaims(); },
            error: () => this.showToast('error', 'Failed to reject claim.')
        });
    }

    showToast(type: 'success' | 'error', message: string): void {
        this.toast = { type, message };
        setTimeout(() => this.toastAlert?.nativeElement?.focus());
        setTimeout(() => this.toast = null, 3000);
    }

    onSearch(): void {
        this.page = 0;
        this.loadClaims();
    }

    onStatusChange(newStatus: string): void {
        this.status = newStatus;
        this.page = 0;
        this.loadClaims();
    }

    clearFilters(): void {
        this.search = '';
        this.status = 'All';
        this.page = 0;
        this.loadClaims();
    }
}
