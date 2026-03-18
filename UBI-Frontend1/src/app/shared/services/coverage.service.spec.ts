import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CoverageService } from './coverage.service';
import { environment } from '../../../environments/environment';

describe('CoverageService', () => {
  let service: CoverageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoverageService]
    });
    service = TestBed.inject(CoverageService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should return fallback plans if no token is present', () => {
    service.getCoveragePlans().subscribe(plans => {
      expect(plans.length).toBe(3);
      expect(plans[0].policyName).toBe('Basic Cover');
    });

    httpMock.expectNone(`${environment.apiUrl}/policies`);
  });

  it('should fetch plans from API and normalize if token is present', () => {
    localStorage.setItem('token', 'mock');
    
    const mockApiRes = {
      content: [
        { policyId: 10, policyName: 'API Cover' }
      ]
    };

    service.getCoveragePlans().subscribe(plans => {
      expect(plans.length).toBe(1);
      expect(plans[0].policyName).toBe('API Cover');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiRes);
  });

  it('should normalize array response directly', () => {
    localStorage.setItem('token', 'mock');
    
    const mockApiRes = [
      { policyId: 10, policyName: 'API Cover Array' }
    ];

    service.getCoveragePlans().subscribe(plans => {
      expect(plans.length).toBe(1);
      expect(plans[0].policyName).toBe('API Cover Array');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
    req.flush(mockApiRes);
  });

  it('should return fallback on API error', () => {
    localStorage.setItem('token', 'mock');

    service.getCoveragePlans().subscribe(plans => {
      expect(plans.length).toBe(3); // Fallback data
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
    req.flush('Error', { status: 500, statusText: 'Internal Error' });
  });
});
