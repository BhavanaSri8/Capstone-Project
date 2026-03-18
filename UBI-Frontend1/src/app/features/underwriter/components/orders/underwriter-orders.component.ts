import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UnderwriterService, UnderwriterApplication } from '../../services/underwriter.service';
import { environment } from '../../../../../environments/environment';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

interface AppDocument {
  originalName: string;
  storedName: string;
}

@Component({
  selector: 'app-underwriter-orders',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, RouterLink, FormsModule],
  templateUrl: './underwriter-orders.component.html',
})
export class UnderwriterOrdersComponent implements OnInit {
  orders: UnderwriterApplication[] = [];
  loading = true;
  submittingId: number | null = null;
  toast: { type: 'success' | 'error'; message: string } | null = null;

  page = 0;
  totalPages = 0;
  search = '';
  status = 'PENDING';
  private searchSubject = new Subject<string>();

  constructor(private underwriterService: UnderwriterService, private http: HttpClient) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadOrders();
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.underwriterService.getAllApplications(this.page, 10, this.search, this.status).subscribe({
      next: (res) => {
        this.orders = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.search);
  }

  onFilter(): void {
    this.page = 0;
    this.loadOrders();
  }

  clearFilters(): void {
    this.search = '';
    this.status = 'PENDING';
    this.page = 0;
    this.loadOrders();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadOrders(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadOrders(); } }

  getDocuments(app: UnderwriterApplication): AppDocument[] {
    if (!app.documentNames || !app.storedDocumentNames) return [];
    
    const originals = app.documentNames.split(',');
    const stored = app.storedDocumentNames.split(',');
    
    return originals.map((name, i) => ({
      originalName: name.trim(),
      storedName: stored[i]?.trim()
    })).filter(doc => doc.storedName);
  }

  private fetchDocumentBlob(orderId: number, doc: AppDocument, inline: boolean): void {
    const url = `${environment.apiUrl}/policy-orders/${orderId}/documents/${doc.storedName}${inline ? '?inline=true' : ''}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        if (inline) {
          window.open(objectUrl, '_blank');
        } else {
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = doc.originalName;
          link.click();
        }
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      },
      error: () => this.showToast('error', 'Failed to load document.')
    });
  }

  viewDocument(orderId: number, doc: AppDocument): void {
    this.fetchDocumentBlob(orderId, doc, true);
  }

  downloadDocument(orderId: number, doc: AppDocument): void {
    this.fetchDocumentBlob(orderId, doc, false);
  }

  approve(app: UnderwriterApplication): void {
    const remarks = prompt('Approval remarks (optional):') ?? undefined;
    this.submittingId = app.orderId;
    this.underwriterService.approvePolicy(app.orderId, remarks).subscribe({
      next: () => {
        this.showToast('success', 'Application approved!');
        this.submittingId = null;
        this.loadOrders();
      },
      error: (err) => {
        this.showToast('error', err.error?.message || 'Failed to approve');
        this.submittingId = null;
      }
    });
  }

  reject(app: UnderwriterApplication): void {
    const remarks = prompt('Rejection remarks (required):');
    if (!remarks) return;
    this.submittingId = app.orderId;
    this.underwriterService.rejectPolicy(app.orderId, remarks).subscribe({
      next: () => {
        this.showToast('success', 'Application rejected.');
        this.submittingId = null;
        this.loadOrders();
      },
      error: (err) => {
        this.showToast('error', err.error?.message || 'Failed to reject');
        this.submittingId = null;
      }
    });
  }

  requestDocs(app: UnderwriterApplication): void {
    const remarks = prompt('What documents are needed?');
    if (!remarks) return;
    this.submittingId = app.orderId;
    this.underwriterService.requestDocuments(app.orderId, remarks).subscribe({
      next: () => {
        this.showToast('success', 'Document request sent.');
        this.submittingId = null;
        this.loadOrders();
      },
      error: (err) => {
        this.showToast('error', err.error?.message || 'Failed to request documents');
        this.submittingId = null;
      }
    });
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toast = null, 4000);
  }

  getRiskClass(level: string | null): string {
    switch (level) {
      case 'HIGH':   return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:       return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  }
}
