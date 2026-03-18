import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface PaymentHistoryResponse {
  transactionId: string;
  policyId: number;
  policyName?: string;
  customerId?: number;
  customerName?: string;
  amount: number;
  status: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  simulatePayment(policyId: number): Observable<PaymentOrderResponse> {
    return this.http.post<PaymentOrderResponse>(`${this.apiUrl}/simulate`, { policyId });
  }

  downloadInvoice(transactionId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${transactionId}/invoice`, {
      responseType: 'blob'
    });
  }

  getPaymentHistory(page = 0, size = 10, search?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.apiUrl}/history`, { params });
  }

  getFilteredPayments(page = 0, size = 10, search?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<any>(this.apiUrl, { params });
  }
}
