import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { environment } from '../../../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all users', () => {
    const mockRes = { content: [] } as any;
    service.getAllUsers(0, 10).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get user by id', () => {
    const mockRes = { userId: 1 } as any;
    service.getUserById(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should update user role', () => {
    const mockRes = { userId: 1, roleId: 2 } as any;
    service.updateUserRole(1, 2).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1/role?roleId=2`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should deactivate user', () => {
    const mockRes = { userId: 1, status: 'INACTIVE' } as any;
    service.deactivateUser(1).subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1/deactivate`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockRes);
  });

  it('should get dashboard summary', () => {
    const mockRes = { totalUsers: 10 } as any;
    service.getDashboardSummary().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/summary`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get risk distribution', () => {
    const mockRes = { highRisk: 5 } as any;
    service.getRiskDistribution().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/risk-distribution`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get monthly revenue', () => {
    const mockRes = [{ month: 'Jan', amount: 100 }] as any[];
    service.getMonthlyRevenue().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/monthly-revenue`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('should get active subscriptions', () => {
    const mockRes = 5;
    service.getActiveSubscriptions().subscribe(res => expect(res).toEqual(mockRes));

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/active-subscriptions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });
});
