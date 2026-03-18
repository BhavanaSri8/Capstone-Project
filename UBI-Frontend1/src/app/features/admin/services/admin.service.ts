import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page, User, DashboardSummary, RiskDistribution, MonthlyRevenue } from '../../../core/models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }
    getAllUsers(page = 0, size = 10, search?: string, role?: string): Observable<Page<User>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (role) params = params.set('role', role);
        return this.http.get<Page<User>>(`${this.baseUrl}/admin/users`, { params });
    }

    getUserById(userId: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/admin/users/${userId}`);
    }

    updateUserRole(userId: number, roleId: number): Observable<User> {
        const params = new HttpParams().set('roleId', roleId);
        return this.http.put<User>(`${this.baseUrl}/admin/users/${userId}/role`, null, { params });
    }

    deactivateUser(userId: number): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/admin/users/${userId}/deactivate`, null);
    }
    getDashboardSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
    }

    getRiskDistribution(): Observable<RiskDistribution> {
        return this.http.get<RiskDistribution>(`${this.baseUrl}/dashboard/risk-distribution`);
    }

    getMonthlyRevenue(): Observable<MonthlyRevenue[]> {
        return this.http.get<MonthlyRevenue[]>(`${this.baseUrl}/dashboard/monthly-revenue`);
    }

    getActiveSubscriptions(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/dashboard/active-subscriptions`);
    }

    createInternalUser(userData: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/create-user`, userData);
    }
}
