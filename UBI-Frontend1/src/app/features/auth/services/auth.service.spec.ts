import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { RegisterRequest, LoginRequest } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call register API', () => {
    const mockReq: RegisterRequest = { fullName: 'Test', email: 'test@test.com', password: 'pw', phone: '12', roleId: 2 };
    const mockRes = { message: 'Success', email: 'test@test.com', userId: 1, user: {} } as any;

    service.register(mockReq).subscribe(res => {
      expect(res).toEqual(mockRes);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);
  });

  it('should call login API and store auth on success', () => {
    const mockReq: LoginRequest = { email: 'test@test.com', password: 'pw' };
    const mockRes = { token: 'token123', role: 'CUSTOMER', userId: 1 } as any;

    service.login(mockReq).subscribe(res => {
      expect(res.token).toBe('token123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);

    expect(localStorage.getItem('token')).toBe('token123');
    expect(JSON.parse(localStorage.getItem('driveiq_user')!)).toEqual(mockRes);
  });

  it('should clear local storage on logout', () => {
    localStorage.setItem('token', 'some-token');
    localStorage.setItem('driveiq_user', 'some-user');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('driveiq_user')).toBeNull();
  });

  it('should determine isAuthenticated correctly', () => {
    expect(service.isAuthenticated()).toBe(false);
    localStorage.setItem('token', 'exists');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should determine role functions correctly', () => {
    expect(service.getUserRole()).toBeNull();
    
    // Set customer role
    localStorage.setItem('driveiq_user', JSON.stringify({ role: 'CUSTOMER' }));
    expect(service.getUserRole()).toBe('CUSTOMER');
    expect(service.hasRole('CUSTOMER')).toBe(true);
    expect(service.hasRole('ADMIN')).toBe(false);
    expect(service.hasAnyRole(['CUSTOMER', 'ADMIN'])).toBe(true);
  });
});
