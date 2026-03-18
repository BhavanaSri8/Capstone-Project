import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsageService } from '../../services/usage.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { PremiumService } from '../../../../shared/services/premium.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { UsageData, UsageRequest, PolicySubscription, PremiumCalculation } from '../../../../core/models/models';

@Component({
  selector: 'app-customer-usage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent, SidebarComponent, StatCardComponent],
  templateUrl: './customer-usage.component.html'
})
export class CustomerUsageComponent implements OnInit {
  usageForm!: FormGroup;
  activeSubs: PolicySubscription[] = [];
  history: UsageData[] = [];
  latestPremium: PremiumCalculation | null = null;
  submitting = false;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
  userId: number;

  avgDistance = 0;
  nightRatio = 0;

  constructor(
    private usageService: UsageService,
    private subService: SubscriptionService,
    private premiumService: PremiumService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userId = this.authService.getUserId() ?? 0;
  }

  ngOnInit(): void {
    const today = new Date();
    this.usageForm = this.fb.group({
      subscriptionId: ['', Validators.required],
      month: [today.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [today.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(today.getFullYear() + 1)]],
      totalDistanceKm: [0, [Validators.required, Validators.min(0), Validators.max(100000)]],
      nightDrivingHours: [0, [Validators.required, Validators.min(0), Validators.max(744)]]
    });

    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    if (!this.userId) return;
    this.subService.getUserSubscriptions(this.userId).subscribe({
      next: (res: any) => {
        const subs = res.content || res;
        this.activeSubs = subs.filter((s: PolicySubscription) => s.subscriptionStatus === 'ACTIVE');
        if (this.activeSubs.length > 0) {
          this.usageForm.patchValue({ subscriptionId: this.activeSubs[0].subscriptionId });
          this.loadHistory();
        }
      }
    });
  }

  loadHistory(): void {
    const subId = this.usageForm.get('subscriptionId')?.value;
    if (!subId) return;

    this.usageService.getUsageData(subId).subscribe({
      next: (data) => {
        this.history = data;
        this.calculateMetrics();
      }
    });
  }

  calculateMetrics(): void {
    if (this.history.length === 0) { this.avgDistance = 0; this.nightRatio = 0; return; }

    let totalD = 0, totalN = 0;
    this.history.forEach(log => {
      totalD += log.totalDistanceKm;
      totalN += log.nightDrivingHours;
    });

    this.avgDistance = Math.round(totalD / this.history.length);
    this.nightRatio = Math.round(((totalN * 60) / totalD) * 100) || 0;
    if (this.nightRatio > 100) this.nightRatio = 100;
  }

  onSubmit(): void {
    if (this.usageForm.invalid) {
      this.usageForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.latestPremium = null;

    const req: UsageRequest = {
      subscriptionId: parseInt(this.usageForm.value.subscriptionId),
      billingMonth: parseInt(this.usageForm.value.month),
      billingYear: parseInt(this.usageForm.value.year),
      totalDistanceKm: this.usageForm.value.totalDistanceKm,
      nightDrivingHours: this.usageForm.value.nightDrivingHours,
      tripCount: 0,
      riskCategory: 'LOW'
    };

    this.usageService.submitUsageData(req).subscribe({
      next: (usage) => {
        this.premiumService.calculatePremium(req.subscriptionId, usage.usageId).subscribe({
          next: (premium) => {
            this.latestPremium = this.normalizePremium(premium);
            this.submitting = false;
            this.showToast('success', 'Telemetry synced and premium recalculated successfully. Latest premium is shown below and in Premium History.');
            this.loadHistory();
            this.usageForm.patchValue({ totalDistanceKm: 0, nightDrivingHours: 0 });
          },
          error: () => {
            this.submitting = false;
            this.showToast('error', 'Telemetry synced, but premium calculation failed. Please retry from Premium page.');
            this.loadHistory();
          }
        });
      },
      error: (err: any) => {
        this.submitting = false;
        this.showToast('error', err.error?.message || 'Failed to sync data');
      }
    });
  }

  private normalizePremium(premium: PremiumCalculation): PremiumCalculation {
    return {
      ...premium,
      totalModifier: (premium.totalAdditions || 0) - (premium.totalDiscounts || 0)
    };
  }

  getMonthName(monthNum: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || '';
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toastAlert?.nativeElement?.focus());
    setTimeout(() => this.toast = null, 4000);
  }
}
