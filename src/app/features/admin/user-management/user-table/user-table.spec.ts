import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTable } from './user-table';
import { describe, it, expect, beforeEach, vi } from 'vitest';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'resident';
}

const mockUsers: User[] = [
    { id: '1', name: 'Alice', email: 'alice@test.com', role: 'admin' },
    { id: '2', name: 'Bob', email: 'bob@test.com', role: 'resident' },
];

describe('UserTable', () => {
    let component: UserTable;
    let fixture: ComponentFixture<UserTable>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UserTable],
        }).compileComponents();

        fixture = TestBed.createComponent(UserTable);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('users', mockUsers);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should accept and signal the required users input', () => {
        expect(component.users()).toEqual(mockUsers);
    });

    it('should have correct role badges configuration', () => {
        expect(component.roleBadges['admin']).toContain('bg-primary-subtle');
        expect(component.roleBadges['resident']).toContain('bg-success-subtle');
        expect(component.defaultBadge).toContain('bg-secondary-subtle');
    });

    it('should emit edit event with user data', () => {
        const user = mockUsers[0];
        const spy = vi.fn();

        component.edit.subscribe(spy);
        component.edit.emit(user);

        expect(spy).toHaveBeenCalledWith(user);
    });

    it('should emit delete event with user ID', () => {
        const userId = '123';
        const spy = vi.fn();

        component.delete.subscribe(spy);
        component.delete.emit(userId);

        expect(spy).toHaveBeenCalledWith(userId);
    });

    it('should emit register event', () => {
        const spy = vi.fn();

        component.register.subscribe(spy);
        component.register.emit();

        expect(spy).toHaveBeenCalled();
    });
});