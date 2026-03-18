import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UnderwriterDashboard {
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalApplications: number;
  highRiskApplications: number;
}

export interface UnderwriterApplication {
  orderId: number;
  orderStatus: string;
  orderDate: string;
  underwriterRemarks: string | null;
  customerId: number;
  customerName: string;
  customerEmail: string;
  policyId: number;
  policyName: string;
  coverageType: string;
  vehicleId: number | null;
  vehicleType: string | null;
  vehicleNumber: string | null;
  documentNames: string | null;
  storedDocumentNames: string | null;
  riskScore: number | null;
  riskLevel: string;
  driverAge: number | null;
  nightDrivingHours: number | null;
  totalDistanceKm: number | null;
}

@Injectable({ providedIn: 'root' })
export class UnderwriterService {
  private apiUrl = `${environment.apiUrl}/underwriter`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<UnderwriterDashboard> {
    return this.http.get<UnderwriterDashboard>(`${this.apiUrl}/dashboard`);
  }

  getAllApplications(page = 0, size = 10, search?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.apiUrl}/applications`, { params });
  }

  getPendingApplications(): Observable<UnderwriterApplication[]> {
    return this.http.get<UnderwriterApplication[]>(`${this.apiUrl}/applications/pending`);
  }

  approvePolicy(orderId: number, remarks?: string): Observable<UnderwriterApplication> {
    return this.http.post<UnderwriterApplication>(
      `${this.apiUrl}/approve-policy/${orderId}`,
      { remarks }
    );
  }

  rejectPolicy(orderId: number, remarks?: string): Observable<UnderwriterApplication> {
    return this.http.post<UnderwriterApplication>(
      `${this.apiUrl}/reject-policy/${orderId}`,
      { remarks }
    );
  }

  requestDocuments(orderId: number, remarks?: string): Observable<UnderwriterApplication> {
    return this.http.post<UnderwriterApplication>(
      `${this.apiUrl}/request-documents/${orderId}`,
      { remarks }
    );
  }
}
