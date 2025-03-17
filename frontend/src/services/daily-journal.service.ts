// // daily-journal.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class DailyJournalService {
//   private apiUrl = `${environment.apiUrl}/journal`;

//   constructor(private http: HttpClient) { }

//   // Create a new journal entry
//   addJournalEntry(journalEntry: any): Observable<any> {
//     return this.http.post(this.apiUrl, journalEntry);
//   }

//   // Delete a journal entry
//   deleteJournalEntry(id: string): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/${id}`);
//   }

//   // Get all journal entries
//   getAllJournalEntries(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/all`);
//   }

//   // Get journal entry by ID
//   getJournalEntryById(id: string): Observable<any> {
//     return this.http.get(`${this.apiUrl}/${id}`);
//   }

//   // Get journal entries by user
//   getJournalEntriesByUser(userId: string, params?: any): Observable<any> {
//     let httpParams = new HttpParams();
    
//     if (params) {
//       if (params.page) httpParams = httpParams.set('page', params.page);
//       if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
//       if (params.timeRange) httpParams = httpParams.set('timeRange', params.timeRange);
//     }
    
//     return this.http.get(`${this.apiUrl}/user/${userId}`, { params: httpParams });
//   }

// // Get journal entries by date range
// getJournalEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Observable<any> {
//     let httpParams = new HttpParams()
//       .set('startDate', startDate.toISOString())
//       .set('endDate', endDate.toISOString());
    
//     return this.http.get(`${this.apiUrl}/user/${userId}/date-range`, { params: httpParams });
//   }

//   // Get journal statistics
//   getJournalStatistics(userId: string): Observable<any> {
//     return this.http.get(`${this.apiUrl}/user/${userId}/stats`);
//   }

//   // Update a journal entry
//   updateJournalEntry(id: string, journalEntry: any): Observable<any> {
//     return this.http.patch(`${this.apiUrl}/${id}`, journalEntry);
//   }
// }