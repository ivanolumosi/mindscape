import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface DailyJournal {
content: any;
user_name: any;
  id?: number;
  user_id: number;
  entry_date: string | null; // Changed to allow null
  mood: string;
  reflections: string;
  gratitude: string;
  created_at?: string | null; // Changed to allow null
  updated_at?: string | null; // Changed to allow null
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = 'http://localhost:3000/api/journal';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  
  // Add a new journal entry
  addJournalEntry(journal: Partial<DailyJournal>): Observable<DailyJournal> {
    // Format the data to match the backend API expectations
    const payload = {
      userId: journal.user_id,
      entryDate: journal.entry_date,
      mood: journal.mood,
      reflections: journal.reflections,
      gratitude: journal.gratitude
    };
    
    return this.http.post<DailyJournal>(this.apiUrl, payload);
  }
  
  // Delete a journal entry
  deleteJournalEntry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
  // Get a journal entry by ID
  getJournalEntryById(id: number): Observable<DailyJournal> {
    return this.http.get<DailyJournal>(`${this.apiUrl}/${id}`);
  }
  
  getJournalEntriesByUser(userId: number): Observable<DailyJournal[]> {
    return this.http.get<DailyJournal[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map((entries: any[]) => this.processEntryDates(entries))
      );
  }
  
  // Get journal entries by date range
  getJournalEntriesByDateRange(userId: number, startDate: string, endDate: string): Observable<DailyJournal[]> {
    // Format the dates to match backend expectations (if needed)
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/date-range`, { params })
      .pipe(
        map(entries => this.processEntryDates(entries))
      );
  }
  
  // Get journal statistics for a user
  getJournalStatistics(userId: number): Observable<{ TotalEntries: number; FirstEntryDate: string | null; LastEntryDate: string | null }> {
    return this.http.get<{ TotalEntries: number; FirstEntryDate: string | null; LastEntryDate: string | null }>(
      `${this.apiUrl}/user/${userId}/stats`
    );
  }
  
  // Update a journal entry
  updateJournalEntry(id: number, journal: Partial<DailyJournal>): Observable<DailyJournal> {
    // Format the data to match the backend API expectations
    const payload = {
      id: id,
      mood: journal.mood,
      reflections: journal.reflections,
      gratitude: journal.gratitude
    };
    
    return this.http.patch<DailyJournal>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map(entry => this.processEntryDate(entry))
      );
  }
  
  // Get all journal entries (admin only)
  getAllJournalEntries(): Observable<DailyJournal[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`)
      .pipe(
        map(entries => this.processEntryDates(entries))
      );
  }
  
  private processEntryDates(entries: any[]): DailyJournal[] {
    if (!entries || !Array.isArray(entries)) {
      return [];
    }
    
    return entries.map(entry => this.processEntryDate(entry));
  }
  
  private processEntryDate(entry: any): DailyJournal {
    if (!entry) {
      return {
        user_id: 0,
        entry_date: '',
        mood: '',
        reflections: '',
        gratitude: '',
        content: '',
        user_name: ''
      };
    }
  
    return {
      id: entry.id,
      user_id: entry.user_id || 0,
      entry_date: entry.entry_date || '',
      mood: entry.mood || '',
      reflections: entry.reflections || '',
      gratitude: entry.gratitude || '',
      created_at: entry.created_at || null,
      updated_at: entry.updated_at || null,
      content: entry.content || '',
      user_name: entry.user_name || ''
    };
  }
}  