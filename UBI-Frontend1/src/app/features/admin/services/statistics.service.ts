import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatisticsData } from '../../../core/models/models';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) { }

  getDashboardStatistics(): Observable<StatisticsData> {
    return this.http.get<StatisticsData>(`${this.apiUrl}/dashboard`);
  }
}
