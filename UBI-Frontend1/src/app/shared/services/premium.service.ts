import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PremiumCalculation, PremiumRule } from '../../core/models/models';

@Injectable({ providedIn: 'root' })
export class PremiumService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    calculatePremium(subscriptionId: number, usageId: number): Observable<PremiumCalculation> {
        const params = new HttpParams().set('usageId', usageId);
        return this.http.post<PremiumCalculation>(`${this.baseUrl}/premium/calculate/${subscriptionId}`, null, { params });
    }

    getPremiumHistory(subscriptionId: number): Observable<PremiumCalculation[]> {
        return this.http.get<PremiumCalculation[]>(`${this.baseUrl}/premium/history/${subscriptionId}`);
    }
    getAllRules(): Observable<PremiumRule[]> {
        return this.http.get<PremiumRule[]>(`${this.baseUrl}/rules`);
    }

    createRule(rule: Omit<PremiumRule, 'ruleId'>): Observable<PremiumRule> {
        return this.http.post<PremiumRule>(`${this.baseUrl}/rules`, rule);
    }

    updateRule(ruleId: number, rule: Omit<PremiumRule, 'ruleId'>): Observable<PremiumRule> {
        return this.http.put<PremiumRule>(`${this.baseUrl}/rules/${ruleId}`, rule);
    }

    deleteRule(ruleId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/rules/${ruleId}`);
    }

    activateRule(ruleId: number): Observable<PremiumRule> {
        return this.http.put<PremiumRule>(`${this.baseUrl}/rules/${ruleId}/activate`, null);
    }

    deactivateRule(ruleId: number): Observable<PremiumRule> {
        return this.http.put<PremiumRule>(`${this.baseUrl}/rules/${ruleId}/deactivate`, null);
    }
}
