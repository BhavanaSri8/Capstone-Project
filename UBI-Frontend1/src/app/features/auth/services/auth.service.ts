import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse } from '../../../core/models/models';
import { RoleType } from '../../../../models/role.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private readonly VALID_ROLES: RoleType[] = ['ADMIN', 'CUSTOMER', 'CLAIMS_OFFICER', 'UNDERWRITER'];

    constructor(private http: HttpClient) { }

    register(request: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(res => this.storeAuth(res))
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('driveiq_user');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): AuthResponse | null {
        const userStr = localStorage.getItem('driveiq_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getUserRole(): RoleType | null {
        const role = this.getCurrentUser()?.role;
        return this.isValidRole(role) ? role : null;
    }

    hasRole(role: RoleType): boolean {
        return this.getUserRole() === role;
    }

    hasAnyRole(roles: RoleType[]): boolean {
        const currentRole = this.getUserRole();
        return currentRole ? roles.includes(currentRole) : false;
    }

    getUserId(): number | null {
        return this.getCurrentUser()?.userId ?? null;
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, data);
    }

    private storeAuth(auth: AuthResponse): void {
        localStorage.setItem('token', auth.token);
        localStorage.setItem('driveiq_user', JSON.stringify(auth));
    }

    private isValidRole(role: string | undefined): role is RoleType {
        return !!role && this.VALID_ROLES.includes(role as RoleType);
    }
}
