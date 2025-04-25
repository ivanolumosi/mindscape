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
  username: string; // Assuming this comes from the Friend interface in backend
  email: string;
  profileImage?: string;
  faculty?: string;
  role?: string;
  createdAt: Date;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  // Additional properties that might be joined from user table
  senderName?: string;
  senderEmail?: string;
  senderProfileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private apiUrl = 'http://localhost:3000/api/friends';
  private usersApiUrl = 'http://localhost:3000/api/users';
  
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  private incomingRequestsSubject = new BehaviorSubject<FriendRequest[]>([]);
  private outgoingRequestsSubject = new BehaviorSubject<FriendRequest[]>([]);
  private recommendationsSubject = new BehaviorSubject<User[]>([]);
  
  friends$ = this.friendsSubject.asObservable();
  incomingRequests$ = this.incomingRequestsSubject.asObservable();
  outgoingRequests$ = this.outgoingRequestsSubject.asObservable();
  recommendations$ = this.recommendationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    // Initialize data if user is logged in
    if (this.authService.isLoggedIn()) {
      this.loadFriendsList();
      this.loadIncomingFriendRequests();
      this.loadOutgoingFriendRequests();
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
  loadIncomingFriendRequests(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.http.get<FriendRequest[]>(`${this.apiUrl}/requests/incoming/${userId}`).pipe(
      tap(requests => this.incomingRequestsSubject.next(requests)),
      catchError(error => {
        console.error('Error loading incoming friend requests:', error);
        return of([]);
      })
    ).subscribe();
  }

  // Get outgoing friend requests
  loadOutgoingFriendRequests(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.http.get<FriendRequest[]>(`${this.apiUrl}/requests/outgoing/${userId}`).pipe(
      tap(requests => this.outgoingRequestsSubject.next(requests)),
      catchError(error => {
        console.error('Error loading outgoing friend requests:', error);
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
        
        // Get IDs of users who have pending requests (both directions)
        const incomingRequestUserIds = this.incomingRequestsSubject.value.map(r => r.senderId);
        const outgoingRequestUserIds = this.outgoingRequestsSubject.value.map(r => r.receiverId);
        
        // Filter out current user, existing friends, and users with pending requests
        return users.filter(user => 
          user.id !== currentUserId && 
          !currentFriends.includes(user.id!) &&
          !incomingRequestUserIds.includes(user.id!) &&
          !outgoingRequestUserIds.includes(user.id!)
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
        // Refresh after sending request
        this.loadOutgoingFriendRequests();
        this.loadRecommendations();
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
        // Refresh after accepting
        this.loadFriendsList();
        this.loadIncomingFriendRequests();
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
        // Refresh after rejecting
        this.loadIncomingFriendRequests();
        this.loadRecommendations(); // May want to recommend users whose requests were rejected
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
        // Refresh after removing
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

  // Check if two users are friends
  checkFriendship(friendId: number): Observable<boolean> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return of(false);

    return this.http.get<boolean>(`${this.apiUrl}/check/${userId}/${friendId}`).pipe(
      catchError(error => {
        console.error('Error checking friendship status:', error);
        return of(false);
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