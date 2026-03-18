import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PolicyService } from './policy.service';
import { environment } from '../../../environments/environment';

describe('PolicyService', () => {
  let service: PolicyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PolicyService]
    });
    service = TestBed.inject(PolicyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all policies', () => {
    const mockRes = { content: [], totalElements: 0 };
    service.getAllPolicies(1, 20).subscribe(res => expect(res).toEqual(mockRes as any));

    const req = httpMock.expectOne(`${environment.apiUrl}/policies?page=1&size=20`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get policy by id', () => {
    const mockRes = { policyId: 1, policyName: 'Test' };
    service.getPolicyById(1).subscribe(res => expect(res).toEqual(mockRes as any));

    const req = httpMock.expectOne(`${environment.apiUrl}/policies/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should create policy', () => {
    const mockReq = { policyName: 'Test', basePremium: 100 } as any;
    const mockRes = { policyId: 1, ...mockReq };
    
    service.createPolicy(mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should update policy', () => {
    const mockReq = { policyName: 'Test Update', basePremium: 200 } as any;
    const mockRes = { policyId: 1, ...mockReq };
    
    service.updatePolicy(1, mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policies/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should update policy status', () => {
    const mockRes = { policyId: 1, isActive: true } as any;
    
    service.updatePolicyStatus(1, true).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/policies/1/status?isActive=true`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });
});
