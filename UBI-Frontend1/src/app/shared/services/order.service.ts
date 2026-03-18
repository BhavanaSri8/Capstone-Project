import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page, PolicyOrder, PolicyOrderResponse } from '../../core/models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = `${environment.apiUrl}/policy-orders`;

    constructor(private http: HttpClient) { }

    getAllOrders(page = 0, size = 10, search?: string, status?: string): Observable<Page<PolicyOrder>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (status) params = params.set('status', status);
        return this.http.get<Page<PolicyOrder>>(this.apiUrl, { params });
    }

    getUserOrders(userId: number): Observable<PolicyOrder[]> {
        return this.http.get<PolicyOrder[]>(`${this.apiUrl}/user/${userId}`);
    }

    getOrderById(orderId: number): Observable<PolicyOrderResponse> {
        return this.http.get<PolicyOrderResponse>(`${this.apiUrl}/${orderId}`);
    }

    createOrder(userId: number, policyId: number, vehicleId?: number): Observable<PolicyOrder> {
        let params = new HttpParams().set('userId', userId).set('policyId', policyId);
        if (vehicleId != null) {
            params = params.set('vehicleId', vehicleId);
        }
        return this.http.post<PolicyOrder>(this.apiUrl, null, { params });
    }

    createPolicyOrderWithDocuments(formData: FormData): Observable<PolicyOrder> {
        return this.http.post<PolicyOrder>(this.apiUrl, formData);
    }

    approveOrder(orderId: number): Observable<PolicyOrder> {
        return this.http.put<PolicyOrder>(`${this.apiUrl}/${orderId}/approve`, null);
    }

    rejectOrder(orderId: number): Observable<PolicyOrder> {
        return this.http.put<PolicyOrder>(`${this.apiUrl}/${orderId}/reject`, null);
    }
}
