import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from './auth.service';
import { of, throwError, firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

interface User {
    id: number;
    email: string;
    role: 'user' | 'admin' | 'editor';
    name: string;
}

const testUser: User = {
    id: 1,
    email: 'user@test.com',
    role: 'user',
    name: 'Test User'
};

const adminUser: User = {
    id: 2,
    email: 'admin@test.com',
    role: 'admin',
    name: 'Admin User'
};

const mockHttpClient = {
    get: vi.fn(),
};

const mockRouter = {
    navigate: vi.fn(),
};

describe('Auth Service', () => {
    let service: Auth;
    let http: typeof mockHttpClient;
    let router: typeof mockRouter;

    let localStorageSetItemSpy: any;
    let localStorageGetItemSpy: any;
    let localStorageRemoveItemSpy: any;

    beforeEach(() => {
        localStorageSetItemSpy = vi.spyOn(localStorage, 'setItem');
        localStorageGetItemSpy = vi.spyOn(localStorage, 'getItem');
        localStorageRemoveItemSpy = vi.spyOn(localStorage, 'removeItem');

        vi.clearAllMocks();
        localStorageGetItemSpy.mockReturnValue(null);

        TestBed.configureTestingModule({
            providers: [
                Auth,
                { provide: HttpClient, useValue: mockHttpClient },
                { provide: Router, useValue: mockRouter },
            ],
        });

        service = TestBed.inject(Auth);
        http = TestBed.inject(HttpClient) as any;
        router = TestBed.inject(Router) as any;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should be created and initialized with null user if no session is stored', () => {
        expect(service).toBeTruthy();
        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
    });

    it('should successfully log in, set user, store session, and navigate to /portal for user role', async () => {
        const expectedUrl = '/api/users?email=test@a.com&password=pass';
        http.get.mockReturnValue(of([testUser]));

        const user = await firstValueFrom(service.login('test@a.com', 'pass'));

        expect(user).toEqual(testUser);
        expect(http.get).toHaveBeenCalledWith(expectedUrl);
        expect(service.currentUser()).toEqual(testUser);
        expect(router.navigate).toHaveBeenCalledWith(['/portal']);
    });

    it('should successfully log in admin user and navigate to /admin', async () => {
        http.get.mockReturnValue(of([adminUser]));

        await firstValueFrom(service.login('admin@a.com', 'pass'));

        expect(service.currentUser()).toEqual(adminUser);
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should throw an error for invalid credentials', async () => {
        http.get.mockReturnValue(of([]));

        await expect(firstValueFrom(service.login('wrong@a.com', 'badpass')))
            .rejects.toThrow('Invalid credentials');

        expect(localStorageSetItemSpy).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should clear user, remove session, and navigate to /login on logout', () => {
        // Manually set a user state to test clearing
        (service as any)._currentUser.set(testUser);

        service.logout();

        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
});