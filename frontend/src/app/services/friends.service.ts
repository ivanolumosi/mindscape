import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ProfileService, User } from './profile.service';

export interface Friend {
  id: number;
  userId: number;
  friendId: number;
  status: 'accepted' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  email?: string;
  profileImage?: string;
  faculty?: string;
  role?: string;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  senderName?: string;
  senderProfileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private apiUrl = 'http://localhost:3000/api/friends';
  private usersApiUrl = 'http://localhost:3000/api/users';
  
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  private friendRequestsSubject = new BehaviorSubject<FriendRequest[]>([]);
  private recommendationsSubject = new BehaviorSubject<User[]>([]);
  
  friends$ = this.friendsSubject.asObservable();
  friendRequests$ = this.friendRequestsSubject.asObservable();
  recommendations$ = this.recommendationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    // Initialize data if user is logged in
    if (this.authService.isLoggedIn()) {
      this.loadFriendsList();
      this.loadFriendRequests();
      this.loadRecommendations();
    }
  }

  // Get friend list for current user
  loadFriendsList(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.http.get<Friend[]>(`${this.apiUrl}/list/${userId}`).pipe(
      tap(friends => this.friendsSubject.next(friends)),
      catchError(error => {
        console.error('Error loading friends:', error);
        return of([]);
      })
    ).subscribe();
  }

  // Get incoming friend requests
  loadFriendRequests(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.http.get<FriendRequest[]>(`${this.apiUrl}/requests/${userId}`).pipe(
      tap(requests => this.friendRequestsSubject.next(requests)),
      catchError(error => {
        console.error('Error loading friend requests:', error);
        return of([]);
      })
    ).subscribe();
  }

  // Load friend recommendations - users who are not already friends
  loadRecommendations(): void {
    // First get all users
    this.getAllUsers().pipe(
      map(users => {
        const currentUserId = this.authService.getCurrentUserId();
        const currentFriends = this.friendsSubject.value.map(f => f.friendId);
        
        // Filter out current user and existing friends
        return users.filter(user => 
          user.id !== currentUserId && 
          !currentFriends.includes(user.id!)
        );
      }),
      tap(recommendations => {
        // Shuffle recommendations for randomness
        const shuffled = this.shuffleArray([...recommendations]);
        this.recommendationsSubject.next(shuffled.slice(0, 5)); // Limit to 5 recommendations
      }),
      catchError(error => {
        console.error('Error loading recommendations:', error);
        return of([]);
      })
    ).subscribe();
  }

  // Get all users for recommendations
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersApiUrl}`).pipe(
      catchError(error => {
        console.error('Error fetching all users:', error);
        return of([]);
      })
    );
  }

  // Send a friend request
  sendFriendRequest(receiverId: number): Observable<any> {
    const senderId = this.authService.getCurrentUserId();
    if (!senderId) return of(null);

    return this.http.post(`${this.apiUrl}/request`, { senderId, receiverId }).pipe(
      tap(() => {
        // Refresh recommendations and requests after sending
        this.loadRecommendations();
        this.loadFriendRequests();
      }),
      catchError(error => {
        console.error('Error sending friend request:', error);
        return of(null);
      })
    );
  }

  // Accept a friend request
  acceptFriendRequest(requestId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/accept/${requestId}`, {}).pipe(
      tap(() => {
        // Refresh both lists after accepting
        this.loadFriendsList();
        this.loadFriendRequests();
      }),
      catchError(error => {
        console.error('Error accepting friend request:', error);
        return of(null);
      })
    );
  }

  // Reject a friend request
  rejectFriendRequest(requestId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reject/${requestId}`, {}).pipe(
      tap(() => {
        // Refresh requests list after rejecting
        this.loadFriendRequests();
      }),
      catchError(error => {
        console.error('Error rejecting friend request:', error);
        return of(null);
      })
    );
  }

  // Remove a friend
  removeFriend(friendId: number): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return of(null);

    return this.http.delete(`${this.apiUrl}/remove`, {
      body: { userId, friendId }
    }).pipe(
      tap(() => {
        // Refresh friends list and recommendations after removing
        this.loadFriendsList();
        this.loadRecommendations();
      }),
      catchError(error => {
        console.error('Error removing friend:', error);
        return of(null);
      })
    );
  }

  // Get user details by ID
  getUserDetails(userId: number): Observable<User> {
    return this.profileService.getUserProfile(userId).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return of({} as User);
      })
    );
  }

  // Helper function to shuffle array for random recommendations
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
}