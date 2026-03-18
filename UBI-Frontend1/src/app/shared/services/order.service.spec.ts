import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { environment } from '../../../environments/environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all orders', () => {
    const mockRes = { content: [] } as any;
    service.getAllOrders(0, 10).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policy-orders?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get user orders', () => {
    const mockRes = [{ id: 1 }] as any[];
    service.getUserOrders(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policy-orders/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should create order without vehicle', () => {
    const mockRes = { id: 1 } as any;
    service.createOrder(1, 2).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/policy-orders` && r.params.has('userId') && !r.params.has('vehicleId'));
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('userId')).toBe('1');
    expect(req.request.params.get('policyId')).toBe('2');
    req.flush(mockRes);
  });

  it('should create order with vehicle', () => {
    const mockRes = { id: 1 } as any;
    service.createOrder(1, 2, 3).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/policy-orders` && r.params.has('vehicleId'));
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('vehicleId')).toBe('3');
    req.flush(mockRes);
  });

  it('should create policy order with documents', () => {
    const mockRes = { id: 1 } as any;
    const formData = new FormData();
    formData.append('file', new Blob());

    service.createPolicyOrderWithDocuments(formData).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policy-orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    req.flush(mockRes);
  });

  it('should approve order', () => {
    const mockRes = { id: 1, status: 'APPROVED' } as any;
    service.approveOrder(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policy-orders/1/approve`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should reject order', () => {
    const mockRes = { id: 1, status: 'REJECTED' } as any;
    service.rejectOrder(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policy-orders/1/reject`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });
});
