import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Claim } from '../../../core/models/models';

@Injectable({ providedIn: 'root' })
export class ClaimsOfficerService {
    private apiUrl = `${environment.apiUrl}/claims`;

    constructor(private http: HttpClient) { }

    getAllClaims(page = 0, size = 10, search?: string, status?: string): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (status) params = params.set('status', status);
        return this.http.get<any>(this.apiUrl, { params });
    }

    getPendingClaims(): Observable<Claim[]> {
        return this.http.get<Claim[]>(this.apiUrl);
    }

    approveClaim(claimId: number): Observable<Claim> {
        return this.http.put<Claim>(`${this.apiUrl}/${claimId}/approve`, {});
    }

    rejectClaim(claimId: number): Observable<Claim> {
        return this.http.put<Claim>(`${this.apiUrl}/${claimId}/reject`, {});
    }

    downloadDocument(claimId: number, documentName: string): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/${claimId}/documents/${encodeURIComponent(documentName)}`,
            { responseType: 'blob' }
        );
    }
}
