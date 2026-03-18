import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../customer/services/payment.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaymentHistoryResponse, Page } from '../../../../core/models/models';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, FormsModule],
  templateUrl: './admin-payments.component.html'
})
export class AdminPaymentsComponent implements OnInit {
  payments: PaymentHistoryResponse[] = [];
  loading = true;
  page = 0;
  size = 10;
  totalPages = 0;
  search = '';
  status = '';
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
    this.paymentService.getFilteredPayments(this.page, this.size, this.search, this.status).subscribe({
      next: (res: Page<PaymentHistoryResponse>) => {
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

  clearFilters(): void {
    this.search = '';
    this.status = '';
    this.page = 0;
    this.loadPayments();
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadPayments();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadPayments();
    }
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
