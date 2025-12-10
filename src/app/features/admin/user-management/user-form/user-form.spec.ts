import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserForm } from './user-form';
import { UserService } from '../../../../core/services/user';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

(globalThis as any).bootstrap = {
    Modal: class MockModal {
        constructor(public element: any, options?: any) {}
        show = vi.fn();
        hide = vi.fn();
    },
};

const mockUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    unit: '101',
    role: 'resident',
    password: 'oldpassword',
};

const mockUserService = {
    createUser: vi.fn(),
    updateUser: vi.fn(),
};

describe('UserForm Component', () => {
    let component: UserForm;
    let fixture: ComponentFixture<UserForm>;
    let modalInstance: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, UserForm],
            providers: [
                FormBuilder,
                { provide: UserService, useValue: mockUserService },
            ],
        })
            .overrideComponent(UserForm, {
                set: { template: '<div #modalElement></div>' },
            })
            .compileComponents();

        fixture = TestBed.createComponent(UserForm);
        component = fixture.componentInstance;

        fixture.detectChanges();

        modalInstance = (component as any).modalInstance;
    });

    it('should create and initialize the bootstrap modal', () => {
        expect(component).toBeTruthy();
        expect(modalInstance).toBeDefined();
        expect(modalInstance.element).toBeInstanceOf(HTMLElement);
    });

    it('should initialize form with default values for creation mode', () => {
        expect(component.isEditMode()).toBe(false);
        expect(component.residentForm.get('role')?.value).toBe('resident');

        const pwdControl = component.residentForm.get('password');
        expect(pwdControl?.hasValidator).toBeTruthy();
    });

    it('should switch to Edit Mode when userToEdit input is set', () => {
        fixture.componentRef.setInput('userToEdit', mockUser);
        fixture.detectChanges();

        expect(component.isEditMode()).toBe(true);
        expect(component.residentForm.value).toMatchObject({
            name: mockUser.name,
            email: mockUser.email,
            unit: mockUser.unit,
        });

        const pwdControl = component.residentForm.get('password');
        pwdControl?.setValue('');
        expect(pwdControl?.valid).toBe(true);
    });

    it('should revert to Create Mode if userToEdit becomes null', () => {
        fixture.componentRef.setInput('userToEdit', mockUser);
        fixture.detectChanges();
        expect(component.isEditMode()).toBe(true);

        fixture.componentRef.setInput('userToEdit', null);
        fixture.detectChanges();

        expect(component.isEditMode()).toBe(false);
        expect(component.residentForm.get('password')?.value).toBe('123');
    });

    it('should show and hide the modal', () => {
        component.openModal();
        expect(modalInstance.show).toHaveBeenCalled();

        component.closeModal();
        expect(modalInstance.hide).toHaveBeenCalled();
    });

    it('should not submit if form is invalid', () => {
        component.residentForm.patchValue({ name: '' });

        component.onSubmit();

        expect(mockUserService.createUser).not.toHaveBeenCalled();
        expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });

    it('should call createUser when in Create Mode and form is valid', () => {
        const outputSpy = vi.spyOn(component.saveCompleted, 'emit');
        mockUserService.createUser.mockReturnValue(of({ success: true }));

        const formData = {
            name: 'New User',
            email: 'new@test.com',
            unit: '505',
            password: 'password',
            role: 'resident',
        };
        component.residentForm.setValue(formData);

        component.onSubmit();

        expect(mockUserService.createUser).toHaveBeenCalledWith(formData);

        expect(modalInstance.hide).toHaveBeenCalled();
        expect(outputSpy).toHaveBeenCalled();
        expect(component.isLoading()).toBe(false);
        expect(component.residentForm.get('password')?.value).toBe('123');
    });

    it('should call updateUser when in Edit Mode', () => {
        const outputSpy = vi.spyOn(component.saveCompleted, 'emit');
        mockUserService.updateUser.mockReturnValue(of({ success: true }));

        fixture.componentRef.setInput('userToEdit', mockUser);
        fixture.detectChanges();

        component.residentForm.patchValue({ name: 'Updated Name' });

        component.onSubmit();

        expect(mockUserService.updateUser).toHaveBeenCalledWith(
            mockUser.id,
            expect.objectContaining({ name: 'Updated Name' })
        );
        expect(modalInstance.hide).toHaveBeenCalled();
        expect(outputSpy).toHaveBeenCalled();
    });

    it('should reset form to defaults onCancel', () => {
        component.residentForm.patchValue({ name: 'Draft' });
        component.onCancel();

        expect(component.residentForm.get('name')?.value).toBeNull();
        expect(component.residentForm.get('password')?.value).toBe('123');
    });
});