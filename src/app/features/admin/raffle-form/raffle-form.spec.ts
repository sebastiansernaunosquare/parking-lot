import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RaffleForm } from './raffle-form';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RaffleService } from '../../../core/services/raffle';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ElementRef, Component, viewChild } from '@angular/core';

(globalThis as any).bootstrap = {
    Modal: class MockModal {
        constructor(public element: any, options?: any) {}
        show = vi.fn();
        hide = vi.fn();
    },
};

const mockRaffleService = {
    createRaffle: vi.fn(),
};

@Component({
    template: `<app-raffle-form />`,
    standalone: true,
    imports: [RaffleForm, ReactiveFormsModule],
})
class TestHostComponent {}

describe('RaffleForm Component', () => {
    let fixture: ComponentFixture<RaffleForm>;
    let component: RaffleForm;
    let mockModalInstance: any;

    let alertSpy: any;
    let consoleErrorSpy: any;

    beforeEach(async () => {
        alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, RaffleForm],
            providers: [
                FormBuilder,
                { provide: RaffleService, useValue: mockRaffleService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RaffleForm);
        component = fixture.componentInstance;

        (component as any).modalElement = vi.fn().mockReturnValue(
            new ElementRef(document.createElement('div'))
        ) as any;

        fixture.detectChanges();

        mockModalInstance = (component as any).modalInstance;
    });

    afterEach(() => {
        alertSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should create and initialize modal instance in ngAfterViewInit', () => {
        expect(component).toBeTruthy();
        expect(mockModalInstance).toBeDefined();
        expect(mockModalInstance.element).toBeDefined();
    });

    it('should initialize the form with period as empty and totalSpots as 10', () => {
        expect(component.raffleForm.valid).toBe(false);
        expect(component.periodControl?.value).toBe('');
        expect(component.spotsControl?.value).toBe(10);
    });

    it('should open the modal and reset form values correctly', () => {
        component.raffleForm.controls.period.setValue('Test');
        component.raffleForm.controls.totalSpots.setValue(5);

        component.openModal();

        expect(component.periodControl?.value).toBeNull();
        expect(component.spotsControl?.value).toBe(10);
        expect(mockModalInstance.show).toHaveBeenCalled();
    });

    it('should not call createRaffle if the form is invalid', () => {
        component.onSubmit();
        expect(mockRaffleService.createRaffle).not.toHaveBeenCalled();
    });

    it('should call createRaffle, hide modal, and emit raffleCreated on success', () => {
        const raffleCreatedSpy = vi.spyOn(component.raffleCreated, 'emit');
        mockRaffleService.createRaffle.mockReturnValue(of({ success: true }));

        const formData = { period: 'Feb 2026', totalSpots: 20 };
        component.raffleForm.setValue(formData);

        component.onSubmit();

        expect(mockRaffleService.createRaffle).toHaveBeenCalledWith(formData);

        expect(component.isLoading()).toBe(false);
        expect(mockModalInstance.hide).toHaveBeenCalled();
        expect(raffleCreatedSpy).toHaveBeenCalled();
    });

    it('should handle API error by logging, setting loading to false, and showing alert', () => {
        const error = new Error('Creation failed');
        mockRaffleService.createRaffle.mockReturnValue(throwError(() => error));

        const formData = { period: 'Mar 2026', totalSpots: 15 };
        component.raffleForm.setValue(formData);

        component.onSubmit();

        expect(component.isLoading()).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        expect(alertSpy).toHaveBeenCalledWith('Failed to create raffle.');
        expect(mockModalInstance.hide).not.toHaveBeenCalled();
    });
});