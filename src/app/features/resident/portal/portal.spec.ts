import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Portal } from './portal';
import { RaffleService, RegistrationWithRaffle } from '../../../core/services/raffle';
import { Auth } from '../../../core/auth/services/auth.service';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';

type MockUserRole = 'user';

interface MockUser {
    id: number;
    email: string;
    role: MockUserRole;
}

interface MockRaffle {
    id: number;
    period: string;
}

const mockUser: MockUser = {
    id: 101,
    email: 'resident@test.com',
    role: 'user',
};

const mockActiveRaffle: MockRaffle = {
    id: 50,
    period: 'Jan 2026',
};

const mockHistory: RegistrationWithRaffle[] = [
    {
        userId: '101',
        raffleId: '49',
        isWinner: true,
        registrationDate: '12/9/2025',
        raffle: {
            id: '123',
            period: 'Q1',
            status: 'OPEN',
            totalSpots: 10,
        },
        id: '123'
    },
];

const mockCurrentUserSignal = signal<MockUser | null>(mockUser);

const mockRaffleService = {
    getRegistrationHistory: vi.fn(() => of(mockHistory)),
    getActiveRaffle: vi.fn(() => of(mockActiveRaffle)),
    checkRegistration: vi.fn(() => of(false)),
    registerResident: vi.fn(() => of(undefined)),
};

const mockAuthService = {
    currentUser: mockCurrentUserSignal.asReadonly(),
};

const globalConfirmSpy = vi.spyOn(window, 'confirm');
const globalAlertSpy = vi.spyOn(window, 'alert');

describe('Portal Component', () => {
    let component: Portal;
    let fixture: ComponentFixture<Portal>;

    beforeEach(async () => {
        vi.clearAllMocks();
        globalConfirmSpy.mockReturnValue(true);
        globalAlertSpy.mockImplementation(() => {});
        mockCurrentUserSignal.set(mockUser);

        await TestBed.configureTestingModule({
            imports: [Portal, RouterTestingModule],
            providers: [
                { provide: RaffleService, useValue: mockRaffleService },
                { provide: Auth, useValue: mockAuthService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Portal);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        globalConfirmSpy.mockRestore();
        globalAlertSpy.mockRestore();
    });

    it('should create and load data on ngOnInit', () => {
        expect(component).toBeTruthy();
        expect(mockRaffleService.getRegistrationHistory).toHaveBeenCalledWith(mockUser.id);
        expect(mockRaffleService.getActiveRaffle).toHaveBeenCalled();
        expect(component.history()).toEqual(mockHistory);
        expect(component.activeRaffle()).toEqual(mockActiveRaffle);
        expect(mockRaffleService.checkRegistration).toHaveBeenCalledWith(mockUser.id, mockActiveRaffle.id);
        expect(component.isRegistered()).toBe(false);
    });

    it('should update isRegistered signal if user is already registered', () => {
        mockRaffleService.checkRegistration.mockReturnValue(of(true));
        component.loadData();
        expect(component.isRegistered()).toBe(true);
    });

    it('should not proceed if user or raffle is missing', () => {
        mockCurrentUserSignal.set(null);
        component.register();
        expect(globalConfirmSpy).not.toHaveBeenCalled();
        expect(mockRaffleService.registerResident).not.toHaveBeenCalled();
    });

    it('should not register if confirmation is denied', () => {
        globalConfirmSpy.mockReturnValue(false);
        component.register();
        expect(mockRaffleService.registerResident).not.toHaveBeenCalled();
    });

    it('should register successfully, reload data, and show success alert', () => {
        const loadSpy = vi.spyOn(component, 'loadData');

        component.register();

        expect(component.isLoading()).toBe(false);
        expect(component.isRegistered()).toBe(true);
    });

    it('should handle registration error and show failure alert', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockRaffleService.registerResident.mockReturnValue(throwError(() => new Error('API Fail')));

        component.register();

        expect(component.isLoading()).toBe(false);
        vi.spyOn(console, 'error').mockRestore();
    });
});