// src/app/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Seeker } from './profile.service';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // 🔍 Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  // 🔍 Get user by ID
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  // 🎓 Get seekers by faculty
  getUsersByFaculty(faculty: string): Observable<Seeker[]> {
    return this.http.get<Seeker[]>(`${this.apiUrl}/faculty/${encodeURIComponent(faculty)}`);
  }

  // 🎭 Get users by role
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  // 🔄 Update a user
  updateUser(userId: number, updatedData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, updatedData);
  }

  // 🗑 Delete a user
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // 🆕 Register a new seeker
  registerSeeker(seekerData: Partial<Seeker>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, seekerData);
  }
}
