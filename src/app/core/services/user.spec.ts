import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserService } from './user';
import { of, firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { User, UserRole } from '../models/user.model';

const mockUsers: User[] = [
    { id: '1', email: 'admin@test.com', role: 'admin', name: 'Admin One' },
    { id: '2', email: 'resident@test.com', role: 'resident', name: 'Resident Two' },
];

const newUser: Omit<User, 'id'> = {
    email: 'new@test.com',
    role: 'resident',
    name: 'New Resident',
};

const createdUser: User = {
    id: '3',
    email: 'new@test.com',
    role: 'resident',
    name: 'New Resident',
};

const mockHttpClient = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
};

describe('UserService', () => {
    let service: UserService;
    let http: typeof mockHttpClient;

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                UserService,
                { provide: HttpClient, useValue: mockHttpClient },
            ],
        });

        service = TestBed.inject(UserService);
        http = TestBed.inject(HttpClient) as any;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call http.get with the correct URL when calling getUsers', async () => {
        http.get.mockReturnValue(of(mockUsers));

        const users = await firstValueFrom(service.getUsers());

        expect(users).toEqual(mockUsers);
        expect(http.get).toHaveBeenCalledWith('/api/users');
    });

    it('should call http.get with the ID appended when calling getUserById', async () => {
        const singleUser = mockUsers[0];
        http.get.mockReturnValue(of(singleUser));

        const user = await firstValueFrom(service.getUserById(1));

        expect(user).toEqual(singleUser);
        expect(http.get).toHaveBeenCalledWith('/api/users/1');
    });

    it('should call http.get without params when role is undefined', async () => {
        http.get.mockReturnValue(of(mockUsers));

        const users = await firstValueFrom(service.getUsersByRole());

        expect(users).toEqual(mockUsers);
        const args = http.get.mock.calls[0];
        const options = args[1];
        expect(options.params.keys().length).toBe(0);
    });

    it('should call http.get with the role query parameter', async () => {
        const residentUsers = [mockUsers[1]];
        http.get.mockReturnValue(of(residentUsers));

        const users = await firstValueFrom(service.getUsersByRole('resident'));

        expect(users).toEqual(residentUsers);

        const args = http.get.mock.calls[0];
        expect(args[0]).toBe('/api/users');

        const params = args[1].params as HttpParams;
        expect(params.get('role')).toBe('resident');
    });

    it('should call http.post with the correct data and URL', async () => {
        http.post.mockReturnValue(of(createdUser));

        const user = await firstValueFrom(service.createUser(newUser));

        expect(user).toEqual(createdUser);
        expect(http.post).toHaveBeenCalledWith('/api/users', newUser);
    });

    it('should call http.patch with the ID and partial update data', async () => {
        const updateData = { name: 'Updated Name' };
        const updatedUser = { ...mockUsers[0], ...updateData };
        http.patch.mockReturnValue(of(updatedUser));

        const user = await firstValueFrom(service.updateUser('1', updateData));

        expect(user.name).toBe('Updated Name');
        expect(http.patch).toHaveBeenCalledWith('/api/users/1', updateData);
    });

    it('should call http.delete with the correct ID and return void', async () => {
        http.delete.mockReturnValue(of(undefined));

        const result = await firstValueFrom(service.deleteUser('2'));

        expect(result).toBeUndefined();
        expect(http.delete).toHaveBeenCalledWith('/api/users/2');
    });
});