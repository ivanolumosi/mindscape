import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { User } from '../interfaces/users';
import { FriendRequest } from '../interfaces/friends';
import { Friend } from '../interfaces/friends';

@Injectable({
  providedIn: 'root'
})
export class UserprofileService {
  private apiUrl = 'http://localhost:3000/api';

  // 🧠 Store current user profile
  private profileSubject = new BehaviorSubject<User | null>(null);
  public profile$ = this.profileSubject.asObservable();

  // 👥 Store current user’s friends
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  public friends$ = this.friendsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // 🔁 Load current user profile
  loadUserProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.getUserProfile(userId).subscribe(profile => {
      this.profileSubject.next(profile);
    });
  }

  // 📥 Create or update the profile of the current user
  createOrUpdateCurrentUser(userData: Partial<User>): Observable<{ userId: number }> {
    return this.createOrUpdateUser(userData).pipe(
      tap(() => this.loadUserProfile()) // Refresh the profile stream
    );
  }

  // CRUD Operations (User)

  createOrUpdateUser(user: Partial<User>): Observable<{ userId: number }> {
    return this.http.post<{ userId: number }>(`${this.apiUrl}/user`, user);
  }

  getUserProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${userId}`);
  }

  deleteCurrentUser(): Observable<{ message: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');
    return this.deleteUser(userId);
  }

  deleteUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/user/${userId}`);
  }

  // 🤝 Friend Management

  sendFriendRequest(receiverId: number): Observable<{ message: string }> {
    const senderId = this.authService.getCurrentUserId();
    if (!senderId) throw new Error('User not logged in');

    return this.http.post<{ message: string }>(`${this.apiUrl}/friend-request/send`, {
      senderId,
      receiverId
    });
  }

  respondToFriendRequest(requestId: number, response: 'accepted' | 'rejected'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/friend-request/respond`, {
      requestId,
      response
    }).pipe(
      tap(() => this.loadFriendList()) // Refresh friends list after accepting
    );
  }

  cancelFriendRequest(requestId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/friend-request/${requestId}`);
  }

  removeFriend(friendId: number): Observable<{ message: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    return this.http.post<{ message: string }>(`${this.apiUrl}/friend/remove`, {
      userId,
      friendId
    }).pipe(
      tap(() => this.loadFriendList())
    );
  }

  // 📚 Friend Data Streams

  loadFriendList(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.getFriendList(userId).subscribe(friends => {
      this.friendsSubject.next(friends);
    });
  }

  getFriendList(userId: number): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends/${userId}`);
  }

  getPendingFriendRequests(requestType: 'all' | 'sent' = 'all'): Observable<FriendRequest[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const params = new HttpParams().set('requestType', requestType);
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/friend-requests/${userId}`, { params });
  }

  getRecommendedFriends(
    recommendationType: 'all' | 'mutual' = 'all',
    limit: number = 10
  ): Observable<Friend[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const params = new HttpParams()
      .set('recommendationType', recommendationType)
      .set('limit', limit.toString());

    return this.http.get<Friend[]>(`${this.apiUrl}/recommended-friends/${userId}`, { params });
  }
}
