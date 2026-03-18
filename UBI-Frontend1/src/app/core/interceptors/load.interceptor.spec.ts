import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadInterceptor } from './load.interceptor';
import { LoadingService } from '../../shared/services/loading.service';

describe('loadInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy },
        provideHttpClient(withInterceptors([loadInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call loading service show and hide on request', () => {
    http.get('/api/data').subscribe();
    
    expect(loadingServiceSpy.show).toHaveBeenCalled();

    const req = httpMock.expectOne('/api/data');
    req.flush({});

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  it('should call hide even if the request errors', () => {
    http.get('/api/data').subscribe({
      error: () => {}
    });
    
    expect(loadingServiceSpy.show).toHaveBeenCalled();

    const req = httpMock.expectOne('/api/data');
    req.error(new ProgressEvent('error'));

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });
});
