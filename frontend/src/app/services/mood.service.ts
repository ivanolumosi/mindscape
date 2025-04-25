import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface MoodTracker {
  mood_type: any;
  id?: number;
  user_id: number;
  mood: string;
  notes?: string;
  recorded_at: Date;
  
}

export interface MoodStatistic {
count: any;
  mood: string;
  mood_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private apiUrl = 'http://localhost:3000/api/moods';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Add a new mood entry for the currently logged in user
   */
  addMoodEntry(mood: string, notes?: string): Observable<MoodTracker> {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.post<MoodTracker>(this.apiUrl, {
      userId,
      mood,
      notes
    }).pipe(
      tap(result => console.log('Mood entry added:', result))
    );
  }

  /**
   * Delete a mood entry by ID
   */
  deleteMoodEntry(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(err => {
        console.error('Error deleting mood entry:', err);
        throw err;
      })
    );
  }

  /**
   * Get all mood entries for the currently logged in user
   */
  getCurrentUserMoods(): Observable<MoodTracker[]> {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.get<MoodTracker[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(moods => console.log(`Retrieved ${moods.length} mood entries`)),
      map(moods => this.convertDates(moods))
    );
  }

  /**
   * Get mood entries for the current user within a date range
   */
  getMoodsByDateRange(startDate: Date, endDate: Date): Observable<MoodTracker[]> {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    let params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<MoodTracker[]>(
      `${this.apiUrl}/user/${userId}/date-range`, 
      { params }
    ).pipe(
      map(moods => this.convertDates(moods))
    );
  }

  /**
   * Get mood statistics for the currently logged in user
   */
  getCurrentUserMoodStatistics(): Observable<MoodStatistic[]> {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.get<MoodStatistic[]>(`${this.apiUrl}/user/${userId}/stats`);
  }

  /**
   * Update a mood entry
   */
  updateMoodEntry(id: number, mood: string, notes?: string): Observable<MoodTracker> {
    return this.http.patch<MoodTracker>(`${this.apiUrl}/${id}`, {
      mood,
      notes
    }).pipe(
      map(mood => {
        // Ensure date is converted to Date object
        return {
          ...mood,
          recorded_at: new Date(mood.recorded_at)
        };
      })
    );
  }

  /**
   * Helper method to convert string dates to Date objects
   */
  private convertDates(moods: MoodTracker[]): MoodTracker[] {
    return moods.map(mood => ({
      ...mood,
      recorded_at: new Date(mood.recorded_at)
    }));
  }

  /**
   * Get available mood options
   */
  getMoodOptions(): string[] {
    // Common mood options that can be tracked
    return [
      'Happy', 
      'Calm', 
      'Anxious', 
      'Sad', 
      'Excited', 
      'Tired', 
      'Frustrated', 
      'Motivated',
      'Stressed',
      'Grateful'
    ];
  }
}