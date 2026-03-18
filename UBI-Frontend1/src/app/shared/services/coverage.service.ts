import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CoveragePlan {
  policyId: number;
  policyName: string;
  coverageType: string;
  basePremium: number;
  description: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoverageService {
  private apiUrl = `${environment.apiUrl}/policies`;

  constructor(private http: HttpClient) { }

  getCoveragePlans(): Observable<CoveragePlan[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(this.getFallbackCoveragePlans());
    }

    return this.http.get<unknown>(`${this.apiUrl}`).pipe(
      map((response) => this.normalizeCoveragePlans(response)),
      catchError(() => of(this.getFallbackCoveragePlans()))
    );
  }

  private normalizeCoveragePlans(response: unknown): CoveragePlan[] {
    if (Array.isArray(response)) {
      return response as CoveragePlan[];
    }

    if (response && typeof response === 'object') {
      const wrapped = response as {
        content?: unknown;
        data?: unknown;
        result?: unknown;
        items?: unknown;
        policies?: unknown;
      };

      const candidates = [wrapped.content, wrapped.data, wrapped.result, wrapped.items, wrapped.policies];
      const plans = candidates.find((value) => Array.isArray(value));
      if (plans) {
        return plans as CoveragePlan[];
      }
      const nestedCandidates = [wrapped.data, wrapped.result];
      for (const candidate of nestedCandidates) {
        if (candidate && typeof candidate === 'object') {
          const nested = candidate as { content?: unknown; items?: unknown; policies?: unknown };
          if (Array.isArray(nested.content)) {
            return nested.content as CoveragePlan[];
          }
          if (Array.isArray(nested.items)) {
            return nested.items as CoveragePlan[];
          }
          if (Array.isArray(nested.policies)) {
            return nested.policies as CoveragePlan[];
          }
        }
      }
    }

    return [];
  }

  private getFallbackCoveragePlans(): CoveragePlan[] {
    return [
      { policyId: 1, policyName: 'Basic Cover', coverageType: 'THIRD_PARTY', basePremium: 3500, description: 'Essential protection for everyday commuting.', isActive: true },
      { policyId: 2, policyName: 'Smart Cover', coverageType: 'COMPREHENSIVE', basePremium: 5200, description: 'Balanced coverage with telematics-driven pricing.', isActive: true },
      { policyId: 3, policyName: 'Premium Cover', coverageType: 'COMPREHENSIVE', basePremium: 7500, description: 'Expanded benefits and enhanced claim support.', isActive: true }
    ];
  }
}
