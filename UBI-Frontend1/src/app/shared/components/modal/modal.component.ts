import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './modal.component.html'
})
export class ModalComponent {
    @Input() isOpen = false;
    @Input() title = 'Dialog';
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Output() closed = new EventEmitter<void>();

    get sizeClass() {
        return { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' }[this.size];
    }

    onClose(): void { this.closed.emit(); }
}
