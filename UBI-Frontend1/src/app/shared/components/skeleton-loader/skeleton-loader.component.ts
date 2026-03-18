import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './skeleton-loader.component.html'
})
export class SkeletonLoaderComponent {
    @Input() rowCount = 5;
    @Input() colCount = 4;

    get rows() { return Array(this.rowCount); }
    get columns() { return Array(this.colCount); }
}
