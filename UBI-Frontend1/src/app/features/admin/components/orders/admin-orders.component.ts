import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../../shared/services/order.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PolicyOrder } from '../../../../core/models/models';
import { environment } from '../../../../../environments/environment';

interface AppDocument {
  originalName: string;
  storedName: string;
}

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent],
    templateUrl: './admin-orders.component.html',
})
export class AdminOrdersComponent implements OnInit {
    orders: PolicyOrder[] = [];
    allOrders: PolicyOrder[] = [];
    loading = false;
    processing: number | null = null;
    page = 0;
    totalPages = 0;
    toast: { type: 'success' | 'error'; message: string } | null = null;
    @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
    filterStatus: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';
    search = '';

    constructor(private orderService: OrderService, private http: HttpClient) { }

    ngOnInit(): void { this.loadOrders(); }

    loadOrders(): void {
        this.loading = true;
        const statusParam = this.filterStatus === 'ALL' ? undefined : this.filterStatus;
        this.orderService.getAllOrders(this.page, 10, this.search, statusParam).subscribe({
            next: (res: any) => {
                if (res && res.content) {
                    this.orders = res.content;
                    this.allOrders = res.content; // Use this for simplicity in counts or just ignore allOrders
                    this.totalPages = res.totalPages || 0;
                } else {
                    this.orders = [];
                    this.totalPages = 0;
                }
                this.loading = false;
            },
            error: () => { this.orders = []; this.loading = false; }
        });
    }

    onSearch(): void {
        this.page = 0;
        this.loadOrders();
    }

    setFilter(status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'): void {
        this.filterStatus = status;
        this.page = 0;
        this.loadOrders();
    }

    clearFilters(): void {
        this.search = '';
        this.filterStatus = 'ALL';
        this.page = 0;
        this.loadOrders();
    }

    getDocuments(order: PolicyOrder): AppDocument[] {
        if (!order.documentNames || !order.storedDocumentNames) return [];
        const originals = order.documentNames.split(',');
        const stored = order.storedDocumentNames.split(',');
        return originals.map((name, i) => ({
          originalName: name.trim(),
          storedName: stored[i]?.trim()
        })).filter(doc => doc.storedName);
    }

    getPendingCount(): number { return this.allOrders.filter(o => o.orderStatus === 'PENDING').length; }
    getApprovedCount(): number { return this.allOrders.filter(o => o.orderStatus === 'APPROVED').length; }
    getRejectedCount(): number { return this.allOrders.filter(o => o.orderStatus === 'REJECTED').length; }

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

    approve(order: PolicyOrder): void {
        this.processing = order.orderId;
        this.orderService.approveOrder(order.orderId).subscribe({
            next: () => { this.showToast('success', 'Order approved successfully!'); this.processing = null; this.loadOrders(); },
            error: (err) => { this.showToast('error', err.error?.message || 'Failed to approve'); this.processing = null; }
        });
    }

    reject(order: PolicyOrder): void {
        this.processing = order.orderId;
        this.orderService.rejectOrder(order.orderId).subscribe({
            next: () => { this.showToast('success', 'Order rejected.'); this.processing = null; this.loadOrders(); },
            error: (err) => { this.showToast('error', err.error?.message || 'Failed to reject'); this.processing = null; }
        });
    }

    showToast(type: 'success' | 'error', message: string): void {
        this.toast = { type, message };
        setTimeout(() => this.toastAlert?.nativeElement?.focus());
        setTimeout(() => this.toast = null, 3000);
    }
}
