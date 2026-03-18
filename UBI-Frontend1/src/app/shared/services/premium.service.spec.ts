import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PremiumService } from './premium.service';
import { environment } from '../../../environments/environment';

describe('PremiumService', () => {
  let service: PremiumService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PremiumService]
    });
    service = TestBed.inject(PremiumService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should calculate premium', () => {
    const mockRes = { calculatedPremium: 100 } as any;
    service.calculatePremium(1, 2).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/premium/calculate/1?usageId=2`);
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);
  });

  it('should get premium history', () => {
    const mockRes = [{ calculatedPremium: 100 }] as any;
    service.getPremiumHistory(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/premium/history/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get all rules', () => {
    const mockRes = [{ ruleId: 1 }] as any;
    service.getAllRules().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/rules`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should create rule', () => {
    const mockReq = { ruleName: 'Rule 1' } as any;
    const mockRes = { ruleId: 1, ...mockReq };
    
    service.createRule(mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/rules`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should update rule', () => {
    const mockReq = { ruleName: 'Rule 1 Updated' } as any;
    const mockRes = { ruleId: 1, ...mockReq };
    
    service.updateRule(1, mockReq).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/rules/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockReq);
    req.flush(mockRes);
  });

  it('should delete rule', () => {
    service.deleteRule(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/rules/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should activate rule', () => {
    const mockRes = { ruleId: 1, isActive: true } as any;
    service.activateRule(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/rules/1/activate`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should deactivate rule', () => {
    const mockRes = { ruleId: 1, isActive: false } as any;
    service.deactivateRule(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/rules/1/deactivate`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });
});
