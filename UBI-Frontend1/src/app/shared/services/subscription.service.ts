import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PolicySubscription } from '../../core/models/models';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    private apiUrl = `${environment.apiUrl}/subscriptions`;

    constructor(private http: HttpClient) { }

    getAllSubscriptions(page = 0, size = 10, search?: string, status?: string): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (status) params = params.set('status', status);
        return this.http.get<any>(this.apiUrl, { params });
    }

    getSubscriptionById(id: number): Observable<PolicySubscription> {
        return this.http.get<PolicySubscription>(`${this.apiUrl}/${id}`);
    }

    getUserSubscriptions(userId: number, page = 0, size = 10, search?: string, status?: string): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (status) params = params.set('status', status);
        return this.http.get<any>(`${this.apiUrl}/user/${userId}`, { params });
    }
    getUserSubscriptionsWithVehicles(userId: number): Observable<PolicySubscription[]> {
        return this.getUserSubscriptions(userId).pipe(
            map((res: any) => {
                const subscriptions = res.content || res;
                return subscriptions.map((sub: any) => ({
                    ...sub,
                    vehicles: sub.vehicles || []
                }));
            })
        );
    }
    getSubscriptionVehicles(subscriptionId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${subscriptionId}/vehicles`);
    }

    updateSubscriptionStatus(id: number, status: string): Observable<PolicySubscription> {
        const params = new HttpParams().set('status', status);
        return this.http.put<PolicySubscription>(`${this.apiUrl}/${id}/status`, null, { params });
    }

    renewSubscription(id: number): Observable<PolicySubscription> {
        return this.http.post<PolicySubscription>(`${this.apiUrl}/${id}/renew`, null);
    }
}
