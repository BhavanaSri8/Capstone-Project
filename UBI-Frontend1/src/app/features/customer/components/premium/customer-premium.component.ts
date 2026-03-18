import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PremiumService } from '../../../../shared/services/premium.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PolicySubscription, PremiumCalculation } from '../../../../core/models/models';

@Component({
  selector: 'app-customer-premium',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, FormsModule],
  templateUrl: './customer-premium.component.html'
})
export class CustomerPremiumComponent implements OnInit {
  activeSubs: PolicySubscription[] = [];
  selectedSubId: number | null = null;
  history: PremiumCalculation[] = [];
  loading = false;
  userId: number;

  constructor(
    private premiumService: PremiumService,
    private subService: SubscriptionService,
    private authService: AuthService
  ) {
    this.userId = this.authService.getUserId() ?? 0;
  }

  ngOnInit(): void {
    if (this.userId) {
      this.subService.getUserSubscriptions(this.userId).subscribe({
        next: (res: any) => {
          const subs = res.content || res;
          this.activeSubs = subs.filter((s: PolicySubscription) => s.subscriptionStatus === 'ACTIVE');
          if (this.activeSubs.length > 0) {
            this.selectedSubId = this.activeSubs[0].subscriptionId;
            this.loadHistory();
          }
        }
      });
    }
  }

  loadHistory(): void {
    if (!this.selectedSubId) return;
    this.loading = true;
    this.premiumService.getPremiumHistory(this.selectedSubId).subscribe({
      next: (data) => {
        this.history = data
          .map(calc => ({
            ...calc,
            totalModifier: (calc.totalAdditions || 0) - (calc.totalDiscounts || 0)
          }))
          .sort((a, b) => new Date(b.calculatedDate).getTime() - new Date(a.calculatedDate).getTime());
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.history = [];
      }
    });
  }
}
