import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially have isLoading$ as false', (done) => {
    service.isLoading$.subscribe(isLoading => {
      expect(isLoading).toBe(false);
      done();
    });
  });

  it('should emit true when show is called', (done) => {
    service.show();
    service.isLoading$.subscribe(isLoading => {
      expect(isLoading).toBe(true);
      done();
    });
  });

  it('should correctly handle multiple shows and hides', (done) => {
    service.show();
    service.show();
    
    let emittedValues: boolean[] = [];
    service.isLoading$.subscribe(val => emittedValues.push(val));

    // After 2 shows, should still emit true (the subscription will grab the latest BehavierSubject value, which is true)
    expect(emittedValues[emittedValues.length - 1]).toBe(true);

    service.hide();
    // After 1 hide, activeRequests is 1, so isLoading$ is still true
    expect(emittedValues[emittedValues.length - 1]).toBe(true);

    service.hide();
    // After 2nd hide, activeRequests is 0, should emit false
    expect(emittedValues[emittedValues.length - 1]).toBe(false);
    
    done();
  });
});
