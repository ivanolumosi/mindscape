import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { User, Seeker, Counselor } from './auth.service';
import { Friend, FriendRequest } from './friends.service';
import { DailyJournal } from './journal.service';
import { MoodTracker, MoodStatistic } from './mood.service';
import { Goal } from './goal.service';
import { Resource } from './resource.service';

@Injectable({
  providedIn: 'root'
})
export class CounsellorManagementService {
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ===== SEEKER MANAGEMENT =====

  /**
   * Get all seekers (for any counselor use)
   */
  getAllSeekers(): Observable<Seeker[]> {
    return this.http.get<Seeker[]>(`${this.apiUrl}/users/role/seeker`);
  }

  /**
   * Get all seekers by faculty for easy filtering
   */
  getSeekersByFaculty(faculty: string): Observable<Seeker[]> {
    return this.http.get<Seeker[]>(`${this.apiUrl}/users/faculty/${encodeURIComponent(faculty)}`);
  }

  /**
   * Get specific seeker profile
   */
  getSeekerProfile(seekerId: number): Observable<Seeker> {
    return this.http.get<Seeker>(`${this.apiUrl}/user/${seekerId}`);
  }

  // ===== SEEKER MOOD TRACKING =====

  /**
   * Get mood entries for a specific seeker
   */
  getSeekerMoods(seekerId: number): Observable<MoodTracker[]> {
    return this.http.get<MoodTracker[]>(`${this.apiUrl}/moods/user/${seekerId}`).pipe(
      map(moods => this.convertDates(moods))
    );
  }

  /**
   * Get mood statistics for a specific seeker
   */
  getSeekerMoodStatistics(seekerId: number): Observable<MoodStatistic[]> {
    return this.http.get<MoodStatistic[]>(`${this.apiUrl}/moods/user/${seekerId}/stats`);
  }

  /**
   * Get mood entries for a specific seeker within a date range
   */
  getSeekerMoodsByDateRange(seekerId: number, startDate: Date, endDate: Date): Observable<MoodTracker[]> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<MoodTracker[]>(
      `${this.apiUrl}/moods/user/${seekerId}/date-range`,
      { params }
    ).pipe(
      map(moods => this.convertDates(moods))
    );
  }

  // ===== SEEKER JOURNAL MANAGEMENT =====

  /**
   * Get journal entries for a specific seeker
   */
  getSeekerJournalEntries(seekerId: number): Observable<DailyJournal[]> {
    return this.http.get<DailyJournal[]>(`${this.apiUrl}/journal/user/${seekerId}`);
  }

  /**
   * Get journal entries for a specific seeker by date range
   */
  getSeekerJournalsByDateRange(seekerId: number, startDate: string, endDate: string): Observable<DailyJournal[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<DailyJournal[]>(`${this.apiUrl}/journal/user/${seekerId}/date-range`, { params });
  }

  /**
   * Get journal statistics for a specific seeker
   */
  getSeekerJournalStatistics(seekerId: number): Observable<{ TotalEntries: number; FirstEntryDate: string | null; LastEntryDate: string | null }> {
    return this.http.get<{ TotalEntries: number; FirstEntryDate: string | null; LastEntryDate: string | null }>(
      `${this.apiUrl}/journal/user/${seekerId}/stats`
    );
  }

  // ===== SEEKER GOALS MANAGEMENT =====

  /**
   * Get all goals for a specific seeker
   */
  getSeekerGoals(seekerId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.apiUrl}/goals/user/${seekerId}`);
  }

  /**
   * Get goals by completion status for a specific seeker
   */
  getSeekerGoalsByStatus(seekerId: number, isCompleted: boolean): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.apiUrl}/goals/user/${seekerId}/status?isCompleted=${isCompleted}`);
  }

  /**
   * Track goal progress for a specific seeker's goal
   */
  trackSeekerGoalProgress(goalId: number): Observable<{ progress_percentage: number }> {
    return this.http.get<{ progress_percentage: number }>(`${this.apiUrl}/goals/${goalId}/progress`);
  }

  // ===== RESOURCES MANAGEMENT =====

  /**
   * Add a new resource for seekers
   */
  addResource(resource: Partial<Resource>): Observable<Resource> {
    const currentUser = this.authService.getCurrentUser();
    
    // If no author is provided, use current user's name
    if (!resource.author && currentUser) {
      resource.author = currentUser.name;
    }
    
    return this.http.post<Resource>(`${this.apiUrl}/resources`, resource);
  }

  /**
   * Get all resources created by current counselor
   */
  getCounselorResources(): Observable<Resource[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of([]);
    }
    
    return this.http.get<Resource[]>(`${this.apiUrl}/resources/author/${currentUser.name}`).pipe(
      map(resources => this.formatResourceDates(resources))
    );
  }

  /**
   * Get all resources (for counselors to recommend)
   */
  getAllResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/resources`).pipe(
      map(resources => this.formatResourceDates(resources))
    );
  }

  /**
   * Get resources by type (for counselors to recommend specific types)
   */
  getResourcesByType(type: string): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/resources/type/${type}`).pipe(
      map(resources => this.formatResourceDates(resources))
    );
  }

  // ===== MESSAGING & CONNECTIONS =====

  /**
   * Send a direct message to a seeker
   */
  sendDirectMessageToSeeker(seekerId: number, content: string, contentType: string = 'text', mediaUrl?: string): Observable<any> {
    const counselorId = this.authService.getCurrentUserId();
    if (!counselorId) throw new Error('Counselor not logged in');

    const body = { 
      senderId: counselorId, 
      receiverId: seekerId, 
      content, 
      contentType, 
      mediaUrl 
    };

    return this.http.post(`${this.apiUrl}/direct-message`, body);
  }

  /**
   * Get chat history with a specific seeker
   */
  getSeekerChatHistory(seekerId: number): Observable<any[]> {
    const counselorId = this.authService.getCurrentUserId();
    if (!counselorId) return of([]);

    return this.http.get<any[]>(`${this.apiUrl}/chat-history/${counselorId}/${seekerId}`);
  }

  /**
   * Send a friend request to a seeker (for counselor-seeker connection)
   */
  sendFriendRequestToSeeker(seekerId: number): Observable<any> {
    const counselorId = this.authService.getCurrentUserId();
    if (!counselorId) return of(null);

    return this.http.post(`${this.apiUrl}/friends/request`, { 
      senderId: counselorId, 
      receiverId: seekerId 
    });
  }

  /**
   * Check friendship status with a seeker
   */
  checkFriendshipWithSeeker(seekerId: number): Observable<boolean> {
    const counselorId = this.authService.getCurrentUserId();
    if (!counselorId) return of(false);

    return this.http.get<boolean>(`${this.apiUrl}/friends/check/${counselorId}/${seekerId}`).pipe(
      catchError(() => of(false))
    );
  }

  // ===== ANALYTICS & INSIGHTS =====

  /**
   * Find similar users to a specific seeker (for recommendations)
   */
  findSimilarUsersToSeeker(seekerId: number, limit: number = 5): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/analytics/similar/${seekerId}`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Get overall mood trends for all seekers (counselor analytics)
   */
  getOverallMoodTrends(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/moods/trends`);
  }

  /**
   * Get faculty-wise metrics (counselor analytics)
   */
  getFacultyMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/faculty-metrics`);
  }

  // ===== HELPER METHODS =====

  /**
   * Helper method to convert string dates to Date objects for mood tracker
   */
  private convertDates(moods: MoodTracker[]): MoodTracker[] {
    return moods.map(mood => ({
      ...mood,
      recorded_at: new Date(mood.recorded_at)
    }));
  }

  /**
   * Helper method to convert string dates to Date objects for resources
   */
  private formatResourceDates(resources: Resource[]): Resource[] {
    return resources.map(resource => ({
      ...resource,
      date_published: resource.date_published ? new Date(resource.date_published) : undefined,
      event_date: resource.event_date ? new Date(resource.event_date) : undefined,
      created_at: new Date(resource.created_at),
      updated_at: new Date(resource.updated_at)
    }));
  }
}