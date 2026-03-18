import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PremiumService } from '../../../../shared/services/premium.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { UsageService } from '../../services/usage.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { OrderService } from '../../../../shared/services/order.service';
import { PaymentService } from '../../services/payment.service';

import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { PolicySubscription, PremiumCalculation, UsageData, PolicyOrder } from '../../../../core/models/models';


@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, SidebarComponent, LoadingSpinnerComponent, FormsModule],
  templateUrl: './customer-dashboard.component.html',
})
export class CustomerDashboardComponent implements OnInit {
  userName = '';
  activeSubs: PolicySubscription[] = [];
  nextPremium: PremiumCalculation | null = null;
  safetyScore = 0;
  safetyMessage = 'No telemetry submitted yet';
  safetyRankText = 'Submit trip data to generate your safety profile';
  loading = true;
  demoDistance = 800;
  demoNight = 10;
  demoPremium = 3850;
  pendingPayments: PolicyOrder[] = [];

  constructor(
    private authService: AuthService,
    private subService: SubscriptionService,
    private premiumService: PremiumService,
    private usageService: UsageService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.email.split('@')[0] || 'Driver';
    this.loadData();
    this.calcDemo();
  }

  loadData(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // Load Subscriptions, Orders, and Payment History in parallel
    forkJoin({
      subs: this.subService.getUserSubscriptions(userId).pipe(catchError(() => of([] as any))),
      orders: this.orderService.getUserOrders(userId).pipe(catchError(() => of([] as any))),
      payments: this.paymentService.getPaymentHistory().pipe(catchError(() => of([] as any)))
    }).subscribe({
      next: ({ subs, orders, payments }) => {
        const subscriptions = subs.content || subs;
        this.activeSubs = subscriptions.filter((s: PolicySubscription) => s.subscriptionStatus === 'ACTIVE');
        
        const paymentList = payments.content || payments;
        const orderList = orders.content || orders;

        // Find approved orders that haven't been paid successfully yet
        const successfulPaymentPolicyIds = paymentList
          .filter((p: any) => p.status === 'SUCCESS')
          .map((p: any) => p.policyId); // actually references orderId from our backend map
        
        this.pendingPayments = orderList.filter((o: any) => 
          o.orderStatus === 'APPROVED' && !successfulPaymentPolicyIds.includes(o.orderId)
        );

        if (this.activeSubs.length > 0) {
          this.loadDashboardMetrics(this.activeSubs[0].subscriptionId);
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  loadDashboardMetrics(subId: number): void {
    forkJoin({
      premiumHistory: this.premiumService.getPremiumHistory(subId).pipe(catchError(() => of([] as PremiumCalculation[]))),
      usageHistory: this.usageService.getUsageData(subId).pipe(catchError(() => of([] as UsageData[])))
    }).subscribe({
      next: ({ premiumHistory, usageHistory }) => {
        if (premiumHistory.length > 0) {
          this.nextPremium = premiumHistory[0];
        }
        this.updateSafetyScore(usageHistory);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private updateSafetyScore(usageHistory: UsageData[]): void {
    if (!usageHistory.length) {
      this.safetyScore = 0;
      this.safetyMessage = 'No telemetry submitted yet';
      this.safetyRankText = 'Submit trip data to generate your safety profile';
      return;
    }

    const latest = [...usageHistory].sort((a, b) => b.usageId - a.usageId)[0];
    const distance = latest.totalDistanceKm || 0;
    const nightHours = latest.nightDrivingHours || 0;
    const nightRatio = distance > 0 ? ((nightHours * 60) / distance) * 100 : 0;

    let score = 75;

    if (latest.riskCategory === 'LOW') score += 12;
    else if (latest.riskCategory === 'MEDIUM') score -= 5;
    else score -= 18;

    if (nightRatio > 20) score -= 12;
    else if (nightRatio > 10) score -= 6;
    else score += 4;

    if (distance > 2200) score -= 8;
    else if (distance >= 400 && distance <= 1400) score += 3;

    this.safetyScore = Math.max(0, Math.min(100, Math.round(score)));

    if (this.safetyScore >= 90) {
      this.safetyMessage = 'Outstanding risk profile';
      this.safetyRankText = 'Top 10% of all drivers';
    } else if (this.safetyScore >= 75) {
      this.safetyMessage = 'Strong safety profile';
      this.safetyRankText = 'Top 25% of all drivers';
    } else if (this.safetyScore >= 60) {
      this.safetyMessage = 'Moderate risk profile';
      this.safetyRankText = 'Top 45% of all drivers';
    } else {
      this.safetyMessage = 'Elevated risk profile';
      this.safetyRankText = 'Below average safety band';
    }
  }

  calcDemo(): void {
    let base = 5000;
    if (this.demoDistance < 1000) base -= (1000 - this.demoDistance) * 0.5;
    else if (this.demoDistance > 1500) base += (this.demoDistance - 1500) * 1.5;
    if (this.demoNight > 15) base += (this.demoNight - 15) * 50;

    this.demoPremium = Math.max(1500, Math.round(base));
  }

  payPremium(order: PolicyOrder): void {
    this.router.navigate(['/customer/payments/checkout', order.orderId]);
  }
}
