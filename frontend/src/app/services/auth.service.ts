import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// Define interfaces for user types
export interface BaseUser {
  id?: number;
  userId?: number;
  name: string;
  email: string;
  role: 'seeker' | 'admin' | 'counselor';
  isProfileComplete?: boolean;
  nickname?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  faculty?: string;
  profileImage?: string;
}

export interface Seeker extends BaseUser {
  faculty?: string;
  profileImage?: string;
  wantsDailyEmails?: boolean;
  nickname?: string;
  isProfileComplete?: boolean;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export interface Counselor extends BaseUser {
  profileImage?: string;
  specialization?: string;
  availabilitySchedule?: string;
  nickname?: string;
  faculty?: string; // Add this line
  
  
}

export interface Admin extends BaseUser {
  privileges?: string;
  profileImage?: string;
  faculty?: string; // Add this line

}

// Union type for any user
export type User = Seeker | Counselor | Admin;

// Response interfaces
interface RegisterResponse {
  user?: User;
  userId?: number;
  token?: string;
  message?: string;
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
    private router: Router
  ) {
    // Load user from localStorage on service initialization
    this.loadStoredUser();
    console.log('AuthService initialized with user:', this.currentUserSubject.value);
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        this.currentUserSubject.next(userData);
        console.log('Loaded stored user:', userData);
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

  // Store user data consistently across storage options
  private storeUserData(user: User, token?: string): void {
    // Ensure user object is properly structured
    const userData: User = {
      ...user,
      id: user.id || user.userId,
      userId: user.userId || user.id
    };
    
    // Store in both locations for compatibility
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store token if provided
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // Update the BehaviorSubject
    this.currentUserSubject.next(userData);
    console.log('User data stored:', userData);
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

  // Register new user with improved capture
  register(userData: Partial<User>): Observable<RegisterResponse> {
    console.log("Sending registration request:", userData);
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        console.log('Registration response:', response);
        // Save user data if available from API
        if (response && (response.user || response.userId)) {
          const user: User = response.user || {
            userId: response.userId,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || 'seeker',
            isProfileComplete: false
          };
          
          // Store user data and token if provided
          this.storeUserData(user, response.token);
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  // Login user with improved capture
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && response.token && response.user) {
          // Store user data and token
          this.storeUserData(response.user, response.token);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  // Login and navigate based on role
  loginAndNavigate(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.login(credentials).pipe(
      tap(response => {
        console.log('User logged in and navigating to dashboard');
        this.router.navigate(['/userdash']);
      })
    );
  }

  // Register and navigate to profile completion
  registerAndNavigate(userData: Partial<User>): Observable<RegisterResponse> {
    return this.register(userData).pipe(
      tap(response => {
        console.log('User registered, navigating to profile completion');
        // Navigate to profile page with firstLogin flag
        this.router.navigate(['/profile'], { 
          queryParams: { 
            firstLogin: 'true',
            userId: response.userId || (response.user?.id || response.user?.userId)
          }
        });
      })
    );
  }

  // Logout user
  logout(): void {
    console.log('Logging out user');
    this.clearUserData();
    this.router.navigate(['/login']);
  }

  // Update user profile
  updateProfile(profileData: Partial<User>): Observable<User> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User is not logged in');
    }
    
    return this.http.put<User>(`${this.apiUrl}/profile/${userId}`, profileData).pipe(
      tap(updatedUser => {
        console.log('Profile updated:', updatedUser);
        // Update stored user data by merging with current
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const mergedUser = { 
            ...currentUser, 
            ...updatedUser,
            isProfileComplete: true
          };
          
          this.storeUserData(mergedUser as User);
        }
      })
    );
  }

  // Get user profile
  getProfile(): Observable<User> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User is not logged in');
    }
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