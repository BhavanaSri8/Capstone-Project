import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VehicleService } from './vehicle.service';
import { environment } from '../../../../environments/environment';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VehicleService]
    });
    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get vehicles', () => {
    const mockRes = { content: [] } as any;
    service.getVehicles(0, 10).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicles?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get vehicle by id', () => {
    const mockRes = { vehicleId: 1 } as any;
    service.getVehicleById(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicles/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should create vehicle', () => {
    const mockReq = { make: 'Toyota' } as any;
    const mockRes = { vehicleId: 1, ...mockReq };
    
    service.createVehicle(mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicles`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should update vehicle', () => {
    const mockReq = { make: 'Toyota Updated' } as any;
    const mockRes = { vehicleId: 1, ...mockReq };
    
    service.updateVehicle(1, mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicles/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should delete vehicle', () => {
    service.deleteVehicle(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicles/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should assign vehicle to subscription', () => {
    service.assignVehicleToSubscription(1, 2).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicle-subscriptions?subscriptionId=1&vehicleId=2`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should get vehicle subscriptions', () => {
    const mockRes = [{ vehicleId: 1 }] as any[];
    service.getVehicleSubscriptions(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicle-subscriptions/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get subscription vehicle details correctly returning empty if no subscriptions', () => {
    service.getSubscriptionVehicleDetails(1).subscribe(res => {
      expect(res.length).toBe(0);
    });

    const req1 = httpMock.expectOne(`${environment.apiUrl}/vehicle-subscriptions/1`);
    req1.flush([]);
  });

  it('should get subscription vehicle details by fetching individual vehicles', fakeAsync(() => {
    const mockSubscriptions = [{ vehicleId: 10 }, { vehicle: { vehicleId: 20 } }];
    const mockVehicle10 = { vehicleId: 10, make: 'Ford' };
    const mockVehicle20 = { vehicleId: 20, make: 'BMW' };

    service.getSubscriptionVehicleDetails(1).subscribe(res => {
      expect(res.length).toBe(2);
      expect(res).toEqual([mockVehicle10, mockVehicle20] as any);
    });

    const req1 = httpMock.expectOne(`${environment.apiUrl}/vehicle-subscriptions/1`);
    req1.flush(mockSubscriptions);

    tick();

    const req2 = httpMock.expectOne(`${environment.apiUrl}/vehicles/10`);
    req2.flush(mockVehicle10);

    const req3 = httpMock.expectOne(`${environment.apiUrl}/vehicles/20`);
    req3.flush(mockVehicle20);
  }));
});
