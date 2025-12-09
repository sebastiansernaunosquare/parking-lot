import { Injectable, inject } from '@angular/core';
import { User, UserRole } from '../models/user.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private readonly API_URL = '/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  getUsersByRole(role?: UserRole) {
    let params = new HttpParams();

    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<User[]>(this.API_URL, { params });
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    // json-server automatically generates the 'id'
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
