import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect to login if no token is present', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('driveiq_user');

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access if token and user are present and no specific role is required', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('driveiq_user', JSON.stringify({ role: 'CUSTOMER' }));

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({ data: {} } as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should allow access if user has the required role', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('driveiq_user', JSON.stringify({ role: 'ADMIN' }));

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({ data: { role: 'ADMIN' } } as any as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard if user role does not match required role', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('driveiq_user', JSON.stringify({ role: 'CUSTOMER' }));

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({ data: { role: 'ADMIN' } } as any as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/dashboard']);
  });
});
