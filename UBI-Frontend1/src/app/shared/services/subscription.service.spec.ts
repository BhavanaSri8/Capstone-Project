import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SubscriptionService } from './subscription.service';
import { environment } from '../../../environments/environment';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionService]
    });
    service = TestBed.inject(SubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all subscriptions', () => {
    const mockRes = [{ subscriptionId: 1 }] as any[];
    service.getAllSubscriptions().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/subscriptions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get subscription by id', () => {
    const mockRes = { subscriptionId: 1 } as any;
    service.getSubscriptionById(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/subscriptions/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get user subscriptions', () => {
    const mockRes = [{ subscriptionId: 1 }] as any[];
    service.getUserSubscriptions(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/subscriptions/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get user subscriptions with default vehicles array', () => {
    const mockRes = [
      { subscriptionId: 1, vehicles: [{ vehicleId: 1 }] },
      { subscriptionId: 2 } // Missing vehicles property
    ] as any[];

    service.getUserSubscriptionsWithVehicles(1).subscribe(res => {
      expect(res[0].vehicles).toEqual([{ vehicleId: 1 }] as any);
      expect(res[1].vehicles).toEqual([]); // Should be mapped to empty array
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/subscriptions/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get subscription vehicles', () => {
    const mockRes = [{ vehicleId: 1 }] as any[];
    service.getSubscriptionVehicles(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/subscriptions/1/vehicles`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should update subscription status', () => {
    const mockRes = { subscriptionId: 1, status: 'ACTIVE' } as any;
    service.updateSubscriptionStatus(1, 'ACTIVE').subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/subscriptions/1/status?status=ACTIVE`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should renew subscription', () => {
    const mockRes = { subscriptionId: 1 } as any;
    service.renewSubscription(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/subscriptions/1/renew`);
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);
  });
});
