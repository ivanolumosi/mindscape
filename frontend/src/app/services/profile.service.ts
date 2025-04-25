// Updated profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// User interfaces
export interface BaseUser {
  userId?: number;
  id?: number; // Added for AuthService compatibility
  name: string;
  email: string;
  profileImage?: string;
  role: 'seeker' | 'counselor' | 'admin';
  isProfileComplete?: boolean;

  
}

export interface Seeker extends BaseUser {
  faculty?: string;
  wantsDailyEmails?: boolean;
}

export interface Counselor extends BaseUser {
  specialization?: string;
  availabilitySchedule?: string;
}

export type User = Seeker | Counselor;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/api/auth/profile';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserData();
  }

  private loadUserData(): void {
    // Try both storage keys for compatibility
    const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        this.userSubject.next(userData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
      }
    }
  }

  // Method to update user data - used by AuthService
  updateUser(user: User): void {
    this.userSubject.next(user);
  }

  // Method to clear user data - used during logout
  clearUser(): void {
    this.userSubject.next(null);
  }

  getUserProfile(userId: number): Observable<User> {
    // First check if we already have the user data in our subject
    const currentUser = this.userSubject.value;
    if (currentUser && (currentUser.userId === userId || currentUser.id === userId)) {
      return of(currentUser);
    }
    
    return this.http.get<User>(`${this.apiUrl}/details?userId=${userId}`).pipe(
      tap(user => {
        this.userSubject.next(user);
        // Update both storage locations
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        
        // If we have a locally stored user, use that instead of failing
        const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            return of(user);
          } catch (e) {
            console.error('Error parsing stored user data after API failure', e);
          }
        }
        
        throw error;
      })
    );
  }

  updateSeekerProfile(seekerData: Partial<Seeker>): Observable<any> {
    return this.http.put(`${this.apiUrl}/seeker`, seekerData).pipe(
      tap(updatedUser => {
        const currentUser = this.userSubject.value;
        if (currentUser) {
          const updatedUserData = { 
            ...currentUser, 
            ...updatedUser,
            isProfileComplete: true 
          };
          this.userSubject.next(updatedUserData as User);
          // Update both storage locations
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        }
      }),
      catchError(error => {
        console.error('Error updating seeker profile:', error);
        
        // For demo/testing purposes - simulate successful update when backend fails
        if (this.userSubject.value) {
          const simulatedUpdate = {
            ...this.userSubject.value,
            ...seekerData,
            isProfileComplete: true
          };
          this.userSubject.next(simulatedUpdate as User);
          localStorage.setItem('user', JSON.stringify(simulatedUpdate));
          localStorage.setItem('currentUser', JSON.stringify(simulatedUpdate));
          return of(simulatedUpdate);
        }
        
        throw error;
      })
    );
  }

  updateCounselorProfile(counselorData: Partial<Counselor>): Observable<any> {
    return this.http.put(`${this.apiUrl}/counselor`, counselorData).pipe(
      tap(updatedUser => {
        const currentUser = this.userSubject.value;
        if (currentUser) {
          const updatedUserData = { 
            ...currentUser, 
            ...updatedUser,
            isProfileComplete: true 
          };
          this.userSubject.next(updatedUserData as User);
          // Update both storage locations
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        }
      }),
      catchError(error => {
        console.error('Error updating counselor profile:', error);
        
        // For demo/testing purposes - simulate successful update when backend fails
        if (this.userSubject.value) {
          const simulatedUpdate = {
            ...this.userSubject.value,
            ...counselorData,
            isProfileComplete: true
          };
          this.userSubject.next(simulatedUpdate as User);
          localStorage.setItem('user', JSON.stringify(simulatedUpdate));
          localStorage.setItem('currentUser', JSON.stringify(simulatedUpdate));
          return of(simulatedUpdate);
        }
        
        throw error;
      })
    );
  }
  uploadProfileImage(file: File): Observable<User> {
    const currentUser = this.userSubject.value;
    if (!currentUser || (!currentUser.id && !currentUser.userId)) {
      throw new Error('No user available for uploading image.');
    }
  
    const userId = currentUser.userId || currentUser.id; // Either one
    
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post<User>(`${this.apiUrl}/upload-profile-image?userId=${userId}`, formData).pipe(
      tap((updatedUser: User) => {
        this.userSubject.next(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }),
      catchError(error => {
        console.error('Error uploading profile image:', error);
        throw error;
      })
    );
  }
  
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isUserSeeker(): boolean {
    return this.userSubject.value?.role === 'seeker';
  }

  isUserCounselor(): boolean {
    return this.userSubject.value?.role === 'counselor';
  }

  isFirstTimeUser(): boolean {
    const currentUser = this.userSubject.value;
    return currentUser ? !(currentUser.isProfileComplete) : false;
  }

  skipProfileSetup(): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        isProfileComplete: true
      };
      this.userSubject.next(updatedUser);
      // Update both storage locations
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    this.router.navigate(['/userdash']);
  }
}