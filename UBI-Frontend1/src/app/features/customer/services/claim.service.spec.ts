import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClaimService } from './claim.service';
import { environment } from '../../../../environments/environment';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimService]
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create claim', () => {
    const mockReq = { subscriptionId: 1, claimAmount: 100, claimReason: 'Test' } as any;
    const mockRes = { claimId: 1 } as any;

    service.createClaim(mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should create claim with documents', () => {
    const mockReq = { subscriptionId: 1, claimAmount: 100, claimReason: 'Test' } as any;
    const mockRes = { claimId: 1 } as any;
    const file = new File([''], 'test.png', { type: 'image/png' });

    service.createClaimWithDocuments(mockReq, [file]).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockRes);
  });

  it('should get claims by subscription', () => {
    const mockRes = [{ claimId: 1 }] as any[];
    service.getClaimsBySubscription(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims/subscription/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get all claims', () => {
    const mockRes = [{ claimId: 1 }] as any[];
    service.getAllClaims().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should approve claim', () => {
    const mockRes = { claimId: 1, claimStatus: 'APPROVED' } as any;
    service.approveClaim(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims/1/approve`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should reject claim', () => {
    const mockRes = { claimId: 1, claimStatus: 'REJECTED' } as any;
    service.rejectClaim(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims/1/reject`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });
});
