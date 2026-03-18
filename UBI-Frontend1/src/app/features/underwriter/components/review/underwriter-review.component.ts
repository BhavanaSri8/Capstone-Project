import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { UnderwriterService, UnderwriterApplication } from '../../services/underwriter.service';
import { environment } from '../../../../../environments/environment';

interface AppDocument {
  originalName: string;
  storedName: string;
}

@Component({
  selector: 'app-underwriter-review',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent],
  templateUrl: './underwriter-review.component.html',
})
export class UnderwriterReviewComponent implements OnInit {
  applications: UnderwriterApplication[] = [];
  filteredApplications: UnderwriterApplication[] = [];
  loading = true;
  selectedStatus = 'ALL';
  submittingId: number | null = null;
  toast: { type: 'success' | 'error'; message: string } | null = null;

  page = 0;
  totalPages = 0;

  constructor(private underwriterService: UnderwriterService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.underwriterService.getAllApplications(this.page, 10, undefined, this.selectedStatus === 'ALL' ? undefined : this.selectedStatus).subscribe({
      next: (res) => {
        this.applications = res.content || [];
        this.filteredApplications = this.applications;
        this.totalPages = res.totalPages || 0;
        this.loading = false;
      },
      error: () => { 
        this.applications = [];
        this.filteredApplications = [];
        this.loading = false; 
      }
    });
  }

  applyFilter(): void {
    this.page = 0;
    this.loadApplications();
  }

  readonly statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DOCUMENTS_REQUESTED'];

  setFilter(status: string): void {
    this.selectedStatus = status;
    this.page = 0;
    this.loadApplications();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadApplications(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadApplications(); } }

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
      next: () => { this.submittingId = null; this.showToast('success', `Approved #${app.orderId}`); this.loadApplications(); },
      error: (err) => { this.submittingId = null; this.showToast('error', err.error?.message || 'Failed'); }
    });
  }

  reject(app: UnderwriterApplication): void {
    const remarks = prompt('Rejection reason:');
    if (!remarks) return;
    this.submittingId = app.orderId;
    this.underwriterService.rejectPolicy(app.orderId, remarks).subscribe({
      next: () => { this.submittingId = null; this.showToast('success', `Rejected #${app.orderId}`); this.loadApplications(); },
      error: (err) => { this.submittingId = null; this.showToast('error', err.error?.message || 'Failed'); }
    });
  }

  requestDocs(app: UnderwriterApplication): void {
    const remarks = prompt('Documents required:');
    if (!remarks) return;
    this.submittingId = app.orderId;
    this.underwriterService.requestDocuments(app.orderId, remarks).subscribe({
      next: () => { this.submittingId = null; this.showToast('success', `Documents requested for #${app.orderId}`); this.loadApplications(); },
      error: (err) => { this.submittingId = null; this.showToast('error', err.error?.message || 'Failed'); }
    });
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toast = null, 4000);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-emerald-100 text-emerald-700',
      REJECTED: 'bg-red-100 text-red-700',
      DOCUMENTS_REQUESTED: 'bg-blue-100 text-blue-700'
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
