import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page, PolicyRequest, PolicyResponse } from '../../core/models/models';

@Injectable({ providedIn: 'root' })
export class PolicyService {
    private apiUrl = `${environment.apiUrl}/policies`;

    constructor(private http: HttpClient) { }

    getAllPolicies(page = 0, size = 10, search?: string, status?: boolean): Observable<Page<PolicyResponse>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (status !== undefined && status !== null) params = params.set('status', status.toString());
        return this.http.get<Page<PolicyResponse>>(this.apiUrl, { params });
    }

    getPolicyById(id: number): Observable<PolicyResponse> {
        return this.http.get<PolicyResponse>(`${this.apiUrl}/${id}`);
    }

    createPolicy(request: PolicyRequest): Observable<PolicyResponse> {
        return this.http.post<PolicyResponse>(this.apiUrl, request);
    }

    updatePolicy(id: number, request: PolicyRequest): Observable<PolicyResponse> {
        return this.http.put<PolicyResponse>(`${this.apiUrl}/${id}`, request);
    }

    updatePolicyStatus(id: number, isActive: boolean): Observable<PolicyResponse> {
        const params = new HttpParams().set('isActive', isActive);
        return this.http.put<PolicyResponse>(`${this.apiUrl}/${id}/status`, null, { params });
    }
}
