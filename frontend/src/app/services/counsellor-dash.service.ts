import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { ProfileService, User } from './profile.service';
import { JournalService, DailyJournal } from './journal.service';
import { FriendsService, Friend } from './friends.service';
import { ChatAppService } from './chat-app.service';
import { MoodService, MoodTracker, MoodStatistic } from './mood.service';
import { GoalService, Goal } from './goal.service';
import { UserService } from './user.service';

import { Post } from '../interfaces/PostModel';
import { Comment } from '../interfaces/comment';
import { DirectMessage } from '../interfaces/Direct_messages';

export interface CounsellorDashboardData {
  totalUsers: number;
  totalJournalEntries: number;
  totalMoodEntries: number;
  totalGoals: number;
  moodDistribution: MoodStatistic[];
  recentUsers: User[];
}

export interface StudentProgressData {
  journals: DailyJournal[];
  moods: MoodTracker[];
  goals: Goal[];
  posts: Post[];
  messages: DirectMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class CounsellorDashService {
  private apiUrl = 'http://localhost:3000/api/counsellor';
  private analyticsApi = 'http://localhost:3000/api/analytics';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private profileService: ProfileService,
    private journalService: JournalService,
    private friendsService: FriendsService,
    private chatAppService: ChatAppService,
    private moodService: MoodService,
    private goalService: GoalService,
    private userService: UserService
  ) {}

  // -------------------------
  // Availability Management
  // -------------------------

  setCounselorAvailability(
    counselorId: number,
    day: string,
    startTime: string,
    endTime: string
  ): Observable<any> {
    return this.http.post(`${this.analyticsApi}/availability`, {
      counselorId, day, startTime, endTime
    });
  }

  checkSlotAvailability(
    counselorId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Observable<any> {
    return this.http.post(`${this.analyticsApi}/availability/check`, {
      counselorId, date, startTime, endTime
    });
  }

  // -------------------------
  // Session Management
  // -------------------------

  scheduleSession(sessionData: {
    counselorId: number;
    title: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    maxParticipants: number;
  }): Observable<any> {
    return this.http.post(`${this.analyticsApi}/sessions`, sessionData);
  }

  viewCounselorSessions(counselorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.analyticsApi}/sessions/${counselorId}`);
  }

  cancelSession(sessionId: number, counselorId: number): Observable<any> {
    return this.http.request('delete', `${this.analyticsApi}/sessions/${sessionId}`, {
      body: { counselorId }
    });
  }

  getWeeklyTimetable(counselorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.analyticsApi}/timetable/${counselorId}`);
  }

  // -------------------------
  // Message Management
  // -------------------------

  sendMessageToStudent(senderId: number, receiverId: number, content: string): Observable<DirectMessage> {
    return this.http.post<DirectMessage>(`${this.analyticsApi}/messages/send`, {
      senderId, receiverId, content
    });
  }

  getConversationWithStudent(counselorId: number, seekerId: number): Observable<DirectMessage[]> {
    return this.http.get<DirectMessage[]>(`${this.analyticsApi}/messages/${counselorId}/${seekerId}`);
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.analyticsApi}/messages/${messageId}/read`, {});
  }

  // -------------------------
  // Journal Management
  // -------------------------

  getStudentJournals(userId: number): Observable<DailyJournal[]> {
    return this.journalService.getJournalEntriesByUser(userId);
  }

  getStudentJournalsByDateRange(userId: number, startDate: string, endDate: string): Observable<DailyJournal[]> {
    return this.journalService.getJournalEntriesByDateRange(userId, startDate, endDate);
  }

  getStudentJournalStatistics(userId: number): Observable<{ TotalEntries: number; FirstEntryDate: string | null; LastEntryDate: string | null }> {
    return this.journalService.getJournalStatistics(userId);
  }

  getJournalEntry(entryId: number): Observable<DailyJournal> {
    return this.journalService.getJournalEntryById(entryId);
  }

  getAllJournalEntries(): Observable<DailyJournal[]> {
    return this.journalService.getAllJournalEntries();
  }

  // -------------------------
  // Mood Tracking
  // -------------------------

  getStudentMoods(userId: number): Observable<MoodTracker[]> {
    return this.http.get<MoodTracker[]>(`http://localhost:3000/api/moods/user/${userId}`).pipe(
      map(moods => moods.map(mood => ({
        ...mood,
        recorded_at: new Date(mood.recorded_at)
      })))
    );
  }

  getStudentMoodStatistics(userId: number): Observable<MoodStatistic[]> {
    return this.http.get<MoodStatistic[]>(`http://localhost:3000/api/moods/user/${userId}/stats`);
  }

  getStudentMoodsByDateRange(userId: number, startDate: Date, endDate: Date): Observable<MoodTracker[]> {
    return this.http.get<MoodTracker[]>(
      `http://localhost:3000/api/moods/user/${userId}/date-range`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }
    ).pipe(
      map(moods => moods.map(mood => ({
        ...mood,
        recorded_at: new Date(mood.recorded_at)
      })))
    );
  }

  getMoodOptions(): string[] {
    return this.moodService.getMoodOptions();
  }

  // -------------------------
  // Goals
  // -------------------------

  getStudentGoals(userId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`http://localhost:3000/api/goals/user/${userId}`);
  }

  getStudentGoalsByStatus(userId: number, isCompleted: boolean): Observable<Goal[]> {
    return this.http.get<Goal[]>(
      `http://localhost:3000/api/goals/user/${userId}/status?isCompleted=${isCompleted}`
    );
  }

  getGoalDetails(goalId: number): Observable<Goal> {
    return this.goalService.getGoalById(goalId);
  }

  updateStudentGoalStatus(goalId: number, isCompleted: boolean, progressPercentage: number): Observable<Goal> {
    return this.goalService.updateGoalStatus(goalId, isCompleted, progressPercentage);
  }

  // -------------------------
  // Community (Posts & Comments)
  // -------------------------

  getAllCommunityPosts(): Observable<Post[]> {
    return this.chatAppService.getAllPosts();
  }

  createCommunityPost(content: string): Observable<Post> {
    return this.chatAppService.createPost(content);
  }

  getCommentsForPost(postId: number): Observable<Comment[]> {
    return this.chatAppService.getCommentsByPost(postId);
  }

  addCommentToPost(postId: number, content: string): Observable<Comment> {
    return this.chatAppService.addComment(postId, content);
  }

  // -------------------------
  // Reports & Dashboard
  // -------------------------

  getDashboardData(): Observable<CounsellorDashboardData> {
    return forkJoin({
      users: this.userService.getUsersByRole('student'),
      journals: this.journalService.getAllJournalEntries(),
      moods: this.http.get<MoodTracker[]>('http://localhost:3000/api/moods/all'),
      goals: this.http.get<Goal[]>('http://localhost:3000/api/goals/all'),
      moodStats: this.http.get<MoodStatistic[]>('http://localhost:3000/api/moods/stats/all')
    }).pipe(
      map(results => ({
        totalUsers: results.users.length,
        totalJournalEntries: results.journals.length,
        totalMoodEntries: results.moods.length,
        totalGoals: results.goals.length,
        moodDistribution: results.moodStats,
        recentUsers: results.users.slice(0, 5)
      }))
    );
  }

  getStudentProgressData(studentId: number): Observable<StudentProgressData> {
    return forkJoin({
      journals: this.getStudentJournals(studentId),
      moods: this.getStudentMoods(studentId),
      goals: this.getStudentGoals(studentId),
      posts: this.http.get<Post[]>(`http://localhost:3000/api/chat/posts/user/${studentId}`),
      messages: this.getConversationWithStudent(studentId, studentId)
    });
  }

  generateStudentReport(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/student/${studentId}`);
  }

  generateSummaryReport(facultyFilter?: string): Observable<any> {
    let url = `${this.apiUrl}/reports/summary`;
    if (facultyFilter) {
      url += `?faculty=${encodeURIComponent(facultyFilter)}`;
    }
    return this.http.get(url);
  }

  // -------------------------
  // Utility
  // -------------------------

  isCounselor(): Observable<boolean> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return of(false);

    return this.profileService.getUserProfile(userId).pipe(
      map(user => user.role === 'counselor')
    );
  }
}
