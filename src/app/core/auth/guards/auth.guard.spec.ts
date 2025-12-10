import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthService = {
    isAuthenticated: vi.fn(),
};

const mockRouter = {
    createUrlTree: vi.fn((commands: any[]) => {
        return {
            __kind: 'UrlTree',
            commands: commands,
        } as unknown as UrlTree;
    }),
};

describe('authGuard', () => {
    let authService: Auth;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Auth, useValue: mockAuthService },
                { provide: Router, useValue: mockRouter },
            ],
        });

        authService = TestBed.inject(Auth);
        router = TestBed.inject(Router);

        vi.clearAllMocks();
    });

    const runGuard = () => {
        return TestBed.runInInjectionContext(() => {
            return authGuard({} as any, {} as any);
        });
    };

    it('should return true if the user is authenticated', () => {

        mockAuthService.isAuthenticated.mockReturnValue(true);

        const result = runGuard();

        expect(result).toBe(true);
        expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
        expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
    });

    it('should return a UrlTree redirecting to /login if the user is NOT authenticated', () => {
        mockAuthService.isAuthenticated.mockReturnValue(false);
        const result = runGuard();

        expect(result).toBeInstanceOf(Object);
        expect((result as any).__kind).toBe('UrlTree');

        expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
        expect((result as any).commands).toEqual(['/login']);
    });
});