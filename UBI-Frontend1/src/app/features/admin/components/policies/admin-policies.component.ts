import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { PolicyService } from '../../../../shared/services/policy.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PolicyResponse, PolicyRequest } from '../../../../core/models/models';

@Component({
    selector: 'app-admin-policies',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, ModalComponent, SkeletonLoaderComponent],
    templateUrl: './admin-policies.component.html'
})
export class AdminPoliciesComponent implements OnInit {
    policies: PolicyResponse[] = [];
    loading = false;
    showModal = false;
    submitting = false;
    policyForm!: FormGroup;
    page = 0;
    totalPages = 0;
    successMessage = '';
    errorMessage = '';
    editingPolicyId: number | null = null;
    search = '';
    status: boolean | null = null;

    @ViewChild('successAlert') successAlert?: ElementRef<HTMLDivElement>;
    @ViewChild('errorAlert') errorAlert?: ElementRef<HTMLDivElement>;

    constructor(private policyService: PolicyService, private fb: FormBuilder) { }

    ngOnInit(): void {
        this.policyForm = this.fb.group({
            policyName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            coverageType: ['', Validators.required],
            description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
            basePremium: ['', [Validators.required, Validators.min(1)]],
            policyTermYears: [5, [Validators.required, Validators.min(1), Validators.max(30)]],
            maturityAmount: ['', [Validators.min(0)]],
            hasPremiumWaiver: [false],
            hasPartialWithdrawal: [false],
            withdrawalConditions: ['Withdraw up to 50% of accumulated value after 3 years', [Validators.maxLength(500)]]
        });
        this.loadPolicies();
    }

    loadPolicies(): void {
        this.loading = true;
        this.policyService.getAllPolicies(this.page, 10, this.search, this.status ?? undefined).subscribe({
            next: (res) => { this.policies = res.content; this.totalPages = res.totalPages; this.loading = false; },
            error: () => this.loading = false
        });
    }

    onSearch(): void {
        this.page = 0;
        this.loadPolicies();
    }

    onStatusChange(event: any): void {
        const value = event.target.value;
        this.status = (value === '' || value === 'all') ? null : value === 'true';
        this.page = 0;
        this.loadPolicies();
    }

    clearFilters(): void {
        this.search = '';
        this.status = null;
        this.page = 0;
        this.loadPolicies();
    }

    openCreate(): void {
        this.editingPolicyId = null;
        this.errorMessage = '';
        this.policyForm.reset({
            basePremium: '',
            policyTermYears: 5,
            hasPremiumWaiver: false,
            hasPartialWithdrawal: false,
            withdrawalConditions: 'Withdraw up to 50% of accumulated value after 3 years'
        });
        this.showModal = true;
    }

    openEdit(policy: PolicyResponse): void {
        this.editingPolicyId = policy.policyId;
        this.errorMessage = '';
        this.policyForm.patchValue({
            policyName: policy.policyName,
            coverageType: policy.coverageType,
            description: policy.description,
            basePremium: policy.basePremium,
            policyTermYears: policy.policyTermYears || 5,
            maturityAmount: policy.maturityAmount ?? '',
            hasPremiumWaiver: policy.hasPremiumWaiver ?? false,
            hasPartialWithdrawal: policy.hasPartialWithdrawal ?? false,
            withdrawalConditions: policy.withdrawalConditions || 'Withdraw up to 50% of accumulated value after 3 years'
        });
        this.showModal = true;
    }

    onSubmit(): void {
        if (this.policyForm.invalid) { this.policyForm.markAllAsTouched(); return; }
        this.submitting = true;

        const formValue = this.policyForm.value;
        const req: PolicyRequest = {
            policyName: formValue.policyName?.trim(),
            coverageType: formValue.coverageType,
            description: formValue.description?.trim(),
            basePremium: Number(formValue.basePremium),
            policyTermYears: Number(formValue.policyTermYears),
            maturityAmount: formValue.maturityAmount === '' || formValue.maturityAmount == null ? 0 : Number(formValue.maturityAmount),
            hasPremiumWaiver: !!formValue.hasPremiumWaiver,
            hasPartialWithdrawal: !!formValue.hasPartialWithdrawal,
            withdrawalConditions: formValue.withdrawalConditions?.trim()
        };

        const action = this.editingPolicyId
            ? this.policyService.updatePolicy(this.editingPolicyId, req)
            : this.policyService.createPolicy(req);

        action.subscribe({
            next: () => {
                this.submitting = false;
                this.showModal = false;
                this.successMessage = this.editingPolicyId ? 'Policy updated successfully!' : 'Policy created successfully!';
                this.focusMessage('success');
                this.editingPolicyId = null;
                this.loadPolicies();
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                this.submitting = false;
                if (err?.error && typeof err.error === 'object' && !Array.isArray(err.error)) {
                    const firstValidationMessage = Object.values(err.error)[0] as string | undefined;
                    this.errorMessage = firstValidationMessage || (this.editingPolicyId ? 'Failed to update policy' : 'Failed to create policy');
                } else {
                    this.errorMessage = this.editingPolicyId ? (err.error?.message || 'Failed to update policy') : (err.error?.message || 'Failed to create policy');
                }
                this.focusMessage('error');
            }
        });
    }

    toggleStatus(policy: PolicyResponse): void {
        this.policyService.updatePolicyStatus(policy.policyId, !policy.isActive).subscribe({
            next: () => this.loadPolicies()
        });
    }

    prevPage(): void { if (this.page > 0) { this.page--; this.loadPolicies(); } }
    nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadPolicies(); } }

    private focusMessage(type: 'success' | 'error'): void {
        setTimeout(() => {
            const target = type === 'success' ? this.successAlert?.nativeElement : this.errorAlert?.nativeElement;
            target?.focus();
        });
    }
}
