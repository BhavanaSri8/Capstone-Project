import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UsageRequest, UsageData } from '../../../core/models/models';

@Injectable({ providedIn: 'root' })
export class UsageService {
    private apiUrl = `${environment.apiUrl}/usage`;

    constructor(private http: HttpClient) { }

    submitUsageData(request: UsageRequest): Observable<UsageData> {
        return this.http.post<UsageData>(this.apiUrl, request);
    }

    getUsageData(subscriptionId: number): Observable<UsageData[]> {
        return this.http.get<UsageData[]>(`${this.apiUrl}/subscription/${subscriptionId}`);
    }

    getUsageByMonth(subscriptionId: number, month: number, year: number): Observable<UsageData> {
        const params = new HttpParams().set('month', month).set('year', year);
        return this.http.get<UsageData>(`${this.apiUrl}/subscription/${subscriptionId}/month`, { params });
    }
}
