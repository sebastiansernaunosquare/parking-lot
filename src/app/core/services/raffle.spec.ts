import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { RaffleService } from './raffle';
import { Raffle } from '../models/raffle.model';
import { Registration } from '../models/registration.model';
import { of, firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockRaffle: Raffle = {
    id: '100',
    period: 'Q1 2026',
    totalSpots: 1,
    status: 'OPEN',
};

const mockRegistration: Registration = {
    id: '500',
    userId: 'user1',
    raffleId: '100',
    registrationDate: '2026-01-01',
    isWinner: false,
};

const mockHttpClient = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
};

describe('RaffleService', () => {
    let service: RaffleService;
    let http: typeof mockHttpClient;

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                RaffleService,
                { provide: HttpClient, useValue: mockHttpClient },
            ],
        });

        service = TestBed.inject(RaffleService);
        http = TestBed.inject(HttpClient) as any;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the first open raffle if one exists', async () => {
        http.get.mockReturnValue(of([mockRaffle]));

        const result = await firstValueFrom(service.getActiveRaffle());

        expect(result).toEqual(mockRaffle);
        expect(http.get).toHaveBeenCalledWith('/api/raffles?status=OPEN');
    });

    it('should return null if no open raffle exists', async () => {
        http.get.mockReturnValue(of([]));

        const result = await firstValueFrom(service.getActiveRaffle());

        expect(result).toBeNull();
    });

    it('should create a raffle with status OPEN', async () => {
        const inputData = { period: 'Q2 2026', totalSpots: 5 };
        const expectedPayload = { ...inputData, status: 'OPEN' };
        const responseRaffle = { id: '101', ...expectedPayload };

        http.post.mockReturnValue(of(responseRaffle));

        const result = await firstValueFrom(service.createRaffle(inputData));

        expect(result).toEqual(responseRaffle);
        expect(http.post).toHaveBeenCalledWith('/api/raffles', expectedPayload);
    });

    it('should register a resident with current date and isWinner false', async () => {
        http.post.mockReturnValue(of(mockRegistration));

        const result = await firstValueFrom(service.registerResident('u1', 'r1'));

        expect(result).toEqual(mockRegistration);
        expect(http.post).toHaveBeenCalledWith(
            '/api/registrations',
            expect.objectContaining({
                userId: 'u1',
                raffleId: 'r1',
                isWinner: false,
                registrationDate: expect.any(String),
            })
        );
    });

    it('should return true if registration exists', async () => {
        http.get.mockReturnValue(of([mockRegistration]));

        const result = await firstValueFrom(service.checkRegistration('u1', 'r1'));

        expect(result).toBe(true);
        expect(http.get).toHaveBeenCalledWith(
            '/api/registrations?userId=u1&raffleId=r1'
        );
    });

    it('should return false if registration does not exist', async () => {
        http.get.mockReturnValue(of([]));
        const result = await firstValueFrom(service.checkRegistration('u1', 'r1'));
        expect(result).toBe(false);
    });

    it('should call get with correct expansion parameters', async () => {
        const mockHistory = [{ ...mockRegistration, raffle: mockRaffle }];
        http.get.mockReturnValue(of(mockHistory));

        const result = await firstValueFrom(service.getRegistrationHistory('u1'));

        expect(result).toEqual(mockHistory);
        expect(http.get).toHaveBeenCalledWith(
            '/api/registrations?userId=u1&_expand=raffle&_sort=registrationDate&_order=desc'
        );
    });

    it('should throw NO_OPEN_RAFFLE if no open raffle is found', async () => {
        http.get.mockReturnValue(of([]));

        await expect(firstValueFrom(service.executeRaffle())).rejects.toThrow(
            'NO_OPEN_RAFFLE'
        );
    });

    it('should throw NO_REGISTRATIONS if raffle exists but no users registered', async () => {
        http.get.mockImplementationOnce(() => of([mockRaffle]));
        http.get.mockImplementationOnce(() => of([]));

        await expect(firstValueFrom(service.executeRaffle())).rejects.toThrow(
            'NO_REGISTRATIONS'
        );
    });

    it('should execute successfully: pick winners, patch winners, and close raffle', async () => {
        const reg1 = { id: 'reg1', userId: 'u1', isWinner: false };
        const reg2 = { id: 'reg2', userId: 'u2', isWinner: false };

        const currentRaffle = { ...mockRaffle, id: '99', totalSpots: 1 };

        http.get.mockReturnValueOnce(of([currentRaffle]));

        http.get.mockReturnValueOnce(of([reg1, reg2]));

        http.patch.mockReturnValue(of({ success: true }));

        await firstValueFrom(service.executeRaffle());

        expect(http.get).toHaveBeenCalledWith('/api/registrations?raffleId=99');

        expect(http.patch).toHaveBeenCalledWith('/api/raffles/99', { status: 'CLOSED' });

        expect(http.patch).toHaveBeenCalledTimes(2);

        const patchCalls = http.patch.mock.calls;
        const winnerPatch = patchCalls.find(call =>
            call[0].includes('/api/registrations/') && call[1].isWinner === true
        );
        expect(winnerPatch).toBeDefined();
    });
});