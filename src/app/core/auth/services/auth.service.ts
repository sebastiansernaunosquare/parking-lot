import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserRole } from '../../models/user.model';
import { Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor() {
    const storedUser = localStorage.getItem('user_session');
    if (storedUser) {
      this._currentUser.set(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    const url = `/api/users?email=${email}&password=${password}`;

    return this.http.get<User[]>(url).pipe(
      map((users) => {
        if (!users.length) {
          throw new Error('Invalid credentials');
        }
        return users[0];
      }),
      tap((user) => {
        this._currentUser.set(user);
        localStorage.setItem('user_session', JSON.stringify(user));
        this.redirectBasedOnRole(user.role);
      })
    );
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem('user_session');
    this.router.navigate(['/login']);
  }

  private redirectBasedOnRole(role: UserRole) {
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/portal']);
    }
  }
}
