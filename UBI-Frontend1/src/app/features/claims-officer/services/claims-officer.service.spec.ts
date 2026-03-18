import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClaimsOfficerService } from './claims-officer.service';
import { environment } from '../../../../environments/environment';

describe('ClaimsOfficerService', () => {
  let service: ClaimsOfficerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimsOfficerService]
    });
    service = TestBed.inject(ClaimsOfficerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all claims', () => {
    const mockRes = [{ claimId: 1 }] as any[];
    service.getAllClaims().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get pending claims', () => {
    const mockRes = [{ claimId: 1 }] as any[];
    service.getPendingClaims().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims`); // Same URL in implementation
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should approve claim', () => {
    const mockRes = { claimId: 1 } as any;
    service.approveClaim(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims/1/approve`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should reject claim', () => {
    const mockRes = { claimId: 1 } as any;
    service.rejectClaim(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/claims/1/reject`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should download document', () => {
    const mockBlob = new Blob(['content'], { type: 'text/plain' });
    service.downloadDocument(1, 'doc.txt').subscribe(blob => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/claims/1/documents/doc.txt`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
