import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth.service';
import { roleGuard } from './role.guard';
import { describe, it, expect, vi, beforeEach } from 'vitest';

type MockUserRole = 'admin' | 'user' | 'editor';

interface MockUser {
    role: MockUserRole;
}

const mockAuthService = {
    currentUser: vi.fn(() => null as MockUser | null),
};

const mockRouter = {
    createUrlTree: vi.fn((commands: any[]) => {
        return {
            __kind: 'UrlTree',
            commands: commands,
        } as unknown as UrlTree;
    }),
};

const createMockRouteSnapshot = (role: MockUserRole): ActivatedRouteSnapshot => {
    return {
        data: { role: role },
    } as unknown as ActivatedRouteSnapshot;
};

describe('roleGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Auth, useValue: mockAuthService },
                { provide: Router, useValue: mockRouter },
            ],
        });

        vi.clearAllMocks();
        mockAuthService.currentUser.mockReturnValue(null);
    });

    const runGuard = (expectedRole: MockUserRole) => {
        const mockRoute = createMockRouteSnapshot(expectedRole);
        return TestBed.runInInjectionContext(() => {
            return roleGuard(mockRoute, {} as any);
        });
    };

    it('should redirect to /login if there is no current user', () => {
        const result = runGuard('user');
        expect(mockAuthService.currentUser).toHaveBeenCalled();
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
        expect((result as any).commands).toEqual(['/login']);
    });

    it('should return true if the current user role matches the expected role', () => {
        const user: MockUser = { role: 'editor' };
        mockAuthService.currentUser.mockReturnValue(user);

        const result = runGuard('editor');

        expect(result).toBe(true);
        expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect admin users to /admin if their role does not match the expected role', () => {
        const adminUser: MockUser = { role: 'admin' };
        mockAuthService.currentUser.mockReturnValue(adminUser);

        const result = runGuard('user');

        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/admin']);
        expect((result as any).commands).toEqual(['/admin']);
    });

    it('should redirect non-admin, non-matching users to /portal', () => {
        const editorUser: MockUser = { role: 'editor' };
        mockAuthService.currentUser.mockReturnValue(editorUser);

        const result = runGuard('user');

        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/portal']);
        expect((result as any).commands).toEqual(['/portal']);
    });
});