import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UnderwriterService } from './underwriter.service';
import { environment } from '../../../../environments/environment';

describe('UnderwriterService', () => {
  let service: UnderwriterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UnderwriterService]
    });
    service = TestBed.inject(UnderwriterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get dashboard data', () => {
    const mockRes = { pendingApplications: 5 } as any;
    service.getDashboard().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/underwriter/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get all applications', () => {
    const mockRes = [{ orderId: 1 }] as any[];
    service.getAllApplications().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/underwriter/applications`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get pending applications', () => {
    const mockRes = [{ orderId: 1 }] as any[];
    service.getPendingApplications().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/underwriter/applications/pending`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should approve policy', () => {
    const mockRes = { orderId: 1 } as any;
    service.approvePolicy(1, 'Looks good').subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/underwriter/approve-policy/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ remarks: 'Looks good' });
    req.flush(mockRes);
  });

  it('should reject policy', () => {
    const mockRes = { orderId: 1 } as any;
    service.rejectPolicy(1, 'Missing details').subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/underwriter/reject-policy/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ remarks: 'Missing details' });
    req.flush(mockRes);
  });

  it('should request documents', () => {
    const mockRes = { orderId: 1 } as any;
    service.requestDocuments(1, 'Need ID').subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/underwriter/request-documents/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ remarks: 'Need ID' });
    req.flush(mockRes);
  });
});
