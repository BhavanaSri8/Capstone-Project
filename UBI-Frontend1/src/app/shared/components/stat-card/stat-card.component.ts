import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
    @Input() label = '';
    @Input() value: string | number = 0;
    @Input() sublabel = '';
    @Input() icon = '';
    @Input() color: 'brand' | 'blue' | 'green' | 'amber' | 'red' | 'slate' = 'brand';
    @Input() trend: number | null = null;

    get iconBgClass(): string {
        return {
            brand: 'bg-[#FFF1F7] text-[#75013F]',
            blue: 'bg-blue-50 text-blue-700',
            green: 'bg-emerald-50 text-emerald-700',
            amber: 'bg-amber-50 text-amber-700',
            red: 'bg-red-50 text-red-700',
            slate: 'bg-slate-100 text-slate-600'
        }[this.color];
    }
}
