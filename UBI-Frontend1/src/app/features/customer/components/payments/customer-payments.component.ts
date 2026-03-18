import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';
import { PaymentService, PaymentHistoryResponse } from '../../services/payment.service';

@Component({
  selector: 'app-customer-payments',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, LoadingSpinnerComponent, FormsModule],
  templateUrl: './customer-payments.component.html'
})
export class CustomerPaymentsComponent implements OnInit {
  payments: PaymentHistoryResponse[] = [];
  loading = true;
  page = 0;
  totalPages = 0;
  search = '';
  status = 'All';
  private searchSubject = new Subject<string>();

  constructor(private paymentService: PaymentService) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadPayments();
    });
  }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getPaymentHistory(this.page, 8, this.search, this.status).subscribe({
      next: (res) => {
        this.payments = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
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
    this.loadPayments();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadPayments(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadPayments(); } }

  viewInvoice(transactionId: string): void {
    this.paymentService.downloadInvoice(transactionId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Error viewing invoice:', err);
        alert('Could not open invoice. Please try again later.');
      }
    });
  }

  downloadInvoice(transactionId: string): void {
    this.paymentService.downloadInvoice(transactionId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${transactionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading invoice:', err);
        alert('Could not download invoice. Please try again later.');
      }
    });
  }
}
