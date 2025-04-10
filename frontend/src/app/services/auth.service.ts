// Updated auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';

// Define interfaces for the different user types
interface BaseUser {
  id?: number;
  userId?: number; 
  name: string;
  email: string;
  password?: string;
  role: 'seeker' | 'admin' | 'counselor';
  isProfileComplete?: boolean; 
}

export interface Seeker extends BaseUser {
  faculty?: string;
  profileImage?: string;
  wantsDailyEmails?: boolean;
}

export interface Counselor extends BaseUser {
  profileImage?: string;
  specialization?: string;
  availabilitySchedule?: string;
}

export interface Admin extends BaseUser {
  privileges?: string;
}

// Union type to represent any user type
export type User = Seeker | Counselor | Admin;

// Response interfaces
interface RegisterResponse {
  user?: User;
  userId?: number;
  message?: string;
  [key: string]: any; // Allow for other properties
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private profileService: ProfileService
  ) {
    // Load user from localStorage on service initialization
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    // Check both for backward compatibility
    const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        this.currentUserSubject.next(userData);
        // Update the ProfileService with the stored user data
        this.profileService.updateUser(userData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        this.clearUserData();
      }
    }
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  // Get current user ID
  getCurrentUserId(): number | undefined {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.id || currentUser?.userId;
  }

  // Get current user role
  getUserRole(): string {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.role : '';
  }

  // Get current user object
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Register new user
  register(userData: Partial<User>): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        // Save minimal user data to localStorage for profile page
        if (response && response.user) {
          // Mark as new user with incomplete profile
          const newUser = {
            ...response.user,
            isProfileComplete: false
          };
          localStorage.setItem('user', JSON.stringify(newUser));
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          // Update the ProfileService with the new user data
          this.profileService.updateUser(newUser);
        }
      })
    );
  }

  // Login user
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            
            // Extract user data from token or response
            if (response.user) {
              // Store in both locations for compatibility
              localStorage.setItem('currentUser', JSON.stringify(response.user));
              localStorage.setItem('user', JSON.stringify(response.user));
              this.currentUserSubject.next(response.user);
              // Update the ProfileService with the user data
              this.profileService.updateUser(response.user);
            }
          }
        })
      );
  }

  // Login and navigate based on role - now redirects all to userdash
  loginAndNavigate(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.login(credentials).pipe(
      tap(() => {
        this.router.navigate(['/userdash']);
      })
    );
  }

  // Logout user
  logout(): void {
    this.clearUserData();
    // Also clear the ProfileService
    this.profileService.clearUser();
    this.router.navigate(['/login']);
  }

  // Update user profile
  updateProfile(profileData: Partial<User>): Observable<User> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User is not logged in');
    }
    
    return this.http.put<User>(`${this.apiUrl}/profile/${userId}`, profileData)
      .pipe(
        tap(updatedUser => {
          // Update stored user data
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const mergedUser = { 
              ...currentUser, 
              ...updatedUser,
              isProfileComplete: true
            };
            
            // Update in both locations for compatibility
            localStorage.setItem('currentUser', JSON.stringify(mergedUser));
            localStorage.setItem('user', JSON.stringify(mergedUser));
            this.currentUserSubject.next(mergedUser as User);
            // Update the ProfileService with the updated user data
            this.profileService.updateUser(mergedUser as User);
          }
        })
      );
  }

  // Get user profile
  getProfile(): Observable<User> {
    const userId = this.getCurrentUserId();
    return this.http.get<User>(`${this.apiUrl}/profile/${userId}`);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  // Helper method to determine if current user is an admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Helper method to determine if current user is a counselor
  isCounselor(): boolean {
    return this.hasRole('counselor');
  }

  // Helper method to determine if current user is a seeker
  isSeeker(): boolean {
    return this.hasRole('seeker');
  }
}