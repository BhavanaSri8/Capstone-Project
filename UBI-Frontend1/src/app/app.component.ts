import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { LoadingService } from './shared/services/loading.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, AsyncPipe, LoadingSpinnerComponent],
    templateUrl: './app.component.html'
})
export class AppComponent {
    title = 'driveiq';

    readonly isLoading$;

    constructor(private loadingService: LoadingService) {
        this.isLoading$ = this.loadingService.isLoading$;
    }
}
