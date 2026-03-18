import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page, ClaimRequest, ClaimResponse, Claim } from '../../../core/models/models';

@Injectable({ providedIn: 'root' })
export class ClaimService {
    private apiUrl = `${environment.apiUrl}/claims`;

    constructor(private http: HttpClient) { }

    createClaim(request: ClaimRequest): Observable<ClaimResponse> {
        return this.http.post<ClaimResponse>(this.apiUrl, request);
    }

    createClaimWithDocuments(request: ClaimRequest, documents: File[]): Observable<ClaimResponse> {
        const formData = new FormData();
        formData.append('subscriptionId', String(request.subscriptionId));
        formData.append('claimAmount', String(request.claimAmount));
        formData.append('claimReason', request.claimReason);

        documents.forEach((file) => {
            formData.append('documents', file, file.name);
        });

        return this.http.post<ClaimResponse>(this.apiUrl, formData);
    }

    getClaimsBySubscription(subscriptionId: number): Observable<ClaimResponse[]> {
        return this.http.get<ClaimResponse[]>(`${this.apiUrl}/subscription/${subscriptionId}`);
    }

    getAllClaims(page = 0, size = 10, search?: string, status?: string): Observable<Page<Claim>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (status) params = params.set('status', status);
        return this.http.get<Page<Claim>>(this.apiUrl, { params });
    }

    approveClaim(claimId: number): Observable<Claim> {
        return this.http.put<Claim>(`${this.apiUrl}/${claimId}/approve`, {});
    }

    rejectClaim(claimId: number): Observable<Claim> {
        return this.http.put<Claim>(`${this.apiUrl}/${claimId}/reject`, {});
    }
}
