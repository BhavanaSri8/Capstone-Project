import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../../shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderService } from '../../../../../shared/services/order.service';
import { PaymentService } from '../../../services/payment.service';
import { PolicyOrderResponse } from '../../../../../core/models/models';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, SidebarComponent, LoadingSpinnerComponent],
  templateUrl: './payment-checkout.component.html'
})
export class PaymentCheckoutComponent implements OnInit {
  orderId!: number;
  order: PolicyOrderResponse | null = null;
  loading = true;
  processing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('orderId');
    if (idParam) {
      this.orderId = +idParam;
      this.loadOrderDetails();
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order: PolicyOrderResponse) => {
        this.order = order;
        this.loading = false;
        if (order.orderStatus !== 'APPROVED') {
            // If it's already PAID or REJECTED, handle accordingly
            if (order.orderStatus === 'PAID') {
                this.router.navigate(['/customer/payments']);
            }
        }
      },
      error: (err: any) => {
        console.error('Error fetching order:', err);
        this.loading = false;
        alert('Could not load order details. Returning to dashboard.');
        this.router.navigate(['/customer/dashboard']);
      }
    });
  }

  confirmPayment(): void {
    this.processing = true;
    this.paymentService.simulatePayment(this.orderId).subscribe({
      next: (res: any) => {
        alert(`Payment Successful!\nTransaction ID: ${res.orderId}\nInvoice has been sent to your email.`);
        this.router.navigate(['/customer/payments']);
      },
      error: (err: any) => {
        console.error('Payment Error:', err);
        this.processing = false;
        alert('Failed to process simulated payment. Please try again.');
      }
    });
  }
}
