import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Page, VehicleRequest, VehicleResponse } from '../../../core/models/models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
    private apiUrl = `${environment.apiUrl}/vehicles`;

    constructor(private http: HttpClient) { }

    getVehicles(page = 0, size = 10, search?: string, status?: string): Observable<Page<VehicleResponse>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        if (status) params = params.set('status', status);
        return this.http.get<Page<VehicleResponse>>(this.apiUrl, { params });
    }

    getVehicleById(id: number): Observable<VehicleResponse> {
        return this.http.get<VehicleResponse>(`${this.apiUrl}/${id}`);
    }

    createVehicle(request: VehicleRequest): Observable<VehicleResponse> {
        return this.http.post<VehicleResponse>(this.apiUrl, request);
    }

    updateVehicle(id: number, request: VehicleRequest): Observable<VehicleResponse> {
        return this.http.put<VehicleResponse>(`${this.apiUrl}/${id}`, request);
    }

    deleteVehicle(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
    assignVehicleToSubscription(subscriptionId: number, vehicleId: number): Observable<any> {
        const params = new HttpParams().set('subscriptionId', subscriptionId).set('vehicleId', vehicleId);
        return this.http.post(`${environment.apiUrl}/vehicle-subscriptions`, null, { params });
    }

    getVehicleSubscriptions(subscriptionId: number): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/vehicle-subscriptions/${subscriptionId}`);
    }
    getSubscriptionVehicleDetails(subscriptionId: number): Observable<VehicleResponse[]> {
        return this.getVehicleSubscriptions(subscriptionId).pipe(
            switchMap((subscriptions: any[]) => {
                if (!subscriptions || subscriptions.length === 0) {
                    return of([]);
                }
                const uniqueVehicleIds = Array.from(new Set(
                    subscriptions.map((sub: any) => 
                        sub.vehicleId !== undefined ? sub.vehicleId : sub.vehicle?.vehicleId
                    ).filter((id: any) => id)
                ));

                if (uniqueVehicleIds.length === 0) {
                    return of([]);
                }
                const vehicleRequests = uniqueVehicleIds.map(id => 
                    this.getVehicleById(id).pipe(
                        catchError(() => of(null))
                    )
                );

                return forkJoin(vehicleRequests);
            }),
            map(vehicles => vehicles.filter(v => v !== null) as VehicleResponse[]),
            catchError(() => of([]))
        );
    }
}
