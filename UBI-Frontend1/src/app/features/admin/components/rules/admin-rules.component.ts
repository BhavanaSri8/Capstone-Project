import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PremiumService } from '../../../../shared/services/premium.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PremiumRule } from '../../../../core/models/models';

@Component({
    selector: 'app-admin-rules',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, ModalComponent, SkeletonLoaderComponent],
    templateUrl: './admin-rules.component.html',
})
export class AdminRulesComponent implements OnInit {
    rules: PremiumRule[] = [];
    loading = false;
    showModal = false;
    submitting = false;
    ruleForm!: FormGroup;
    toast: { type: 'success' | 'error'; message: string } | null = null;
    @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;

    constructor(private premiumService: PremiumService, private fb: FormBuilder) { }

    ngOnInit(): void {
        this.ruleForm = this.fb.group({
            ruleName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
            ruleType: ['', Validators.required],
            condition: ['', [Validators.required, Validators.maxLength(60)]],
            value: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
            description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
            isActive: [true]
        });
        this.loadRules();
    }

    loadRules(): void {
        this.loading = true;
        this.premiumService.getAllRules().subscribe({
            next: (data) => { this.rules = data; this.loading = false; },
            error: () => this.loading = false
        });
    }

    openCreate(): void {
        this.ruleForm.reset({ isActive: true });
        this.showModal = true;
    }

    onSubmit(): void {
        if (this.ruleForm.invalid) { this.ruleForm.markAllAsTouched(); return; }
        this.submitting = true;
        this.premiumService.createRule(this.ruleForm.value).subscribe({
            next: () => {
                this.submitting = false; this.showModal = false;
                this.showToast('success', 'Rule created successfully');
                this.loadRules();
            },
            error: (err) => {
                this.submitting = false;
                this.showToast('error', err.error?.message || 'Failed to create rule');
            }
        });
    }

    deleteRule(rule: PremiumRule): void {
        if (!confirm(`Delete rule "${rule.ruleName}"?`)) return;
        this.premiumService.deleteRule(rule.ruleId).subscribe({
            next: () => { this.showToast('success', 'Rule deleted'); this.loadRules(); },
            error: () => this.showToast('error', 'Failed to delete rule')
        });
    }

    toggleStatus(rule: PremiumRule): void {
        const action = rule.isActive ? this.premiumService.deactivateRule(rule.ruleId) : this.premiumService.activateRule(rule.ruleId);
        action.subscribe({
            next: () => { this.showToast('success', 'Rule status updated'); this.loadRules(); },
            error: () => this.showToast('error', 'Failed to update rule status')
        });
    }

    showToast(type: 'success' | 'error', message: string): void {
        this.toast = { type, message };
        setTimeout(() => this.toastAlert?.nativeElement?.focus());
        setTimeout(() => this.toast = null, 3000);
    }
}
