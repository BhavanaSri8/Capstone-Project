import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsageService } from './usage.service';
import { environment } from '../../../../environments/environment';

describe('UsageService', () => {
  let service: UsageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsageService]
    });
    service = TestBed.inject(UsageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should submit usage data', () => {
    const mockReq = { subscriptionId: 1, milesDriven: 100 } as any;
    const mockRes = { usageId: 1 } as any;

    service.submitUsageData(mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/usage`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should get usage data', () => {
    const mockRes = [{ usageId: 1 }] as any[];
    service.getUsageData(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/usage/subscription/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get usage by month', () => {
    const mockRes = { usageId: 1 } as any;
    service.getUsageByMonth(1, 10, 2023).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/usage/subscription/1/month?month=10&year=2023`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });
});
