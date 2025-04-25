import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CounsellorDashService, CounsellorDashboardData, StudentProgressData } from '../../services/counsellor-dash.service';
import { AuthService, User } from '../../services/auth.service';
import { DailyJournal } from '../../services/journal.service';
import { MoodTracker, MoodStatistic } from '../../services/mood.service';
import { Goal } from '../../services/goal.service';
import { Post } from '../../interfaces/PostModel';
import { Comment } from '../../interfaces/comment';
import { DirectMessage } from '../../interfaces/Direct_messages';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counselor-dash',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './counselor-dash.component.html',
  styleUrls: ['./counselor-dash.component.css'],
  providers: [CounsellorDashService] // ✅ Properly added
})
export class CounselorDashComponent implements OnInit {

  // Active section tracking
  activeSection: string = 'overview';
  
  // Dashboard data
  dashboardData: CounsellorDashboardData | null = null;
  currentUser: User | null = null;
  
  // Student management
  students: User[] = [];
  filteredStudents: User[] = [];
  faculties: string[] = ['Engineering', 'Arts', 'Science', 'Business', 'Medicine', 'Law'];
  selectedFaculty: string = '';
  selectedStudent: User | null = null;
  studentProgress: StudentProgressData | null = null;
  
  // Session management
  sessionForm: FormGroup;
  availabilityForm: FormGroup;
  counselorSessions: any[] = [];
  weeklyTimetable: any[] = [];
  
  // Messaging
  selectedConversation: {student: User, messages: DirectMessage[]} | null = null;
  messageContent: string = '';
  
  // Mood tracking
  moodOptions: string[] = [];
  moodChartData: any[] = [];
  
  // Date filters
  startDate: string = '';
  endDate: string = '';
  
  // Journal entries
  journalEntries: DailyJournal[] = [];
  selectedJournal: DailyJournal | null = null;
  
  // Goals
  studentGoals: Goal[] = [];
  selectedGoal: Goal | null = null;
  
  // Community posts
  communityPosts: Post[] = [];
  selectedPost: Post | null = null;
  postComments: Comment[] = [];
  newPostContent: string = '';
  newCommentContent: string = '';

  constructor(
    private counsellorService: CounsellorDashService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.sessionForm = this.fb.group({
      title: ['', Validators.required],
      venue: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      description: ['', Validators.required],
      maxParticipants: [10, [Validators.required, Validators.min(1)]]
    });
    
    this.availabilityForm = this.fb.group({
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
    this.loadAllStudents();
    this.loadCounselorSessions();
    this.loadWeeklyTimetable();
    this.loadCommunityPosts();
    this.loadMoodOptions();
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  // Navigation
  setActiveSection(section: string): void {
    this.activeSection = section;
    
    // Load relevant data for the section
    if (section === 'overview') {
      this.loadDashboardData();
    } else if (section === 'students' && !this.students.length) {
      this.loadAllStudents();
    } else if (section === 'sessions' && !this.counselorSessions.length) {
      this.loadCounselorSessions();
      this.loadWeeklyTimetable();
    } else if (section === 'community' && !this.communityPosts.length) {
      this.loadCommunityPosts();
    }
  }

  // Dashboard data
  loadDashboardData(): void {
    this.counsellorService.getDashboardData().subscribe(
      data => {
        this.dashboardData = data;
        this.prepareMoodChartData(data.moodDistribution);
      },
      error => console.error('Error loading dashboard data:', error)
    );
  }

  prepareMoodChartData(moodStats: MoodStatistic[]): void {
    this.moodChartData = moodStats.map(stat => ({
      name: stat.mood,
      value: stat.count
    }));
  }

  // Student management
  loadAllStudents(): void {
    this.counsellorService.getAllStudents().subscribe(
      students => {
        this.students = students;
        this.filteredStudents = [...students];
      },
      error => console.error('Error loading students:', error)
    );
  }

  filterStudentsByFaculty(): void {
    if (!this.selectedFaculty) {
      this.filteredStudents = [...this.students];
      return;
    }
    
    this.counsellorService.getStudentsByFaculty(this.selectedFaculty).subscribe(
      students => {
        this.filteredStudents = students;
      },
      error => console.error('Error filtering students:', error)
    );
  }

  viewStudentDetails(student: User): void {
    this.selectedStudent = student;
    this.loadStudentProgress(student.userId || student.id || 0);
  }

  loadStudentProgress(studentId: number): void {
    this.counsellorService.getStudentProgressData(studentId).subscribe(
      data => {
        this.studentProgress = data;
        this.journalEntries = data.journals;
        this.studentGoals = data.goals;
      },
      error => console.error('Error loading student progress:', error)
    );
  }

  // Session management
  loadCounselorSessions(): void {
    const counselorId = this.currentUser?.id || this.currentUser?.userId || 0;
    this.counsellorService.viewCounselorSessions(counselorId).subscribe(
      sessions => {
        this.counselorSessions = sessions;
      },
      error => console.error('Error loading sessions:', error)
    );
  }

  loadWeeklyTimetable(): void {
    const counselorId = this.currentUser?.id || this.currentUser?.userId || 0;
    this.counsellorService.getWeeklyTimetable(counselorId).subscribe(
      timetable => {
        this.weeklyTimetable = timetable;
      },
      error => console.error('Error loading timetable:', error)
    );
  }

  scheduleNewSession(): void {
    if (this.sessionForm.invalid) {
      return;
    }
    
    const counselorId = this.currentUser?.id || this.currentUser?.userId || 0;
    const sessionData = {
      counselorId,
      ...this.sessionForm.value
    };
    
    this.counsellorService.scheduleSession(sessionData).subscribe(
      response => {
        this.loadCounselorSessions();
        this.sessionForm.reset({
          maxParticipants: 10
        });
      },
      error => console.error('Error scheduling session:', error)
    );
  }

  cancelSession(sessionId: number): void {
    const counselorId = this.currentUser?.id || this.currentUser?.userId || 0;
    this.counsellorService.cancelSession(sessionId, counselorId).subscribe(
      response => {
        this.loadCounselorSessions();
      },
      error => console.error('Error canceling session:', error)
    );
  }

  updateAvailability(): void {
    if (this.availabilityForm.invalid) {
      return;
    }
    
    const counselorId = this.currentUser?.id || this.currentUser?.userId || 0;
    const { day, startTime, endTime } = this.availabilityForm.value;
    
    this.counsellorService.setCounselorAvailability(
      counselorId, day, startTime, endTime
    ).subscribe(
      response => {
        this.loadWeeklyTimetable();
        this.availabilityForm.reset();
      },
      error => console.error('Error updating availability:', error)
    );
  }

  // Messaging
  loadConversation(student: User): void {
    const counselorId = this.currentUser?.id || this.currentUser?.userId || 0;
    const studentId = student.id || student.userId || 0;
    
    this.counsellorService.getConversationWithStudent(counselorId, studentId).subscribe(
      messages => {
        this.selectedConversation = {
          student,
          messages
        };
      },
      error => console.error('Error loading conversation:', error)
    );
  }

  sendMessage(): void {
    if (!this.messageContent.trim() || !this.selectedConversation) {
      return;
    }
    
    const counselorId = this.currentUser?.id || this.currentUser?.userId || 0;
    const receiverId = this.selectedConversation.student.id || 
                      this.selectedConversation.student.userId || 0;
    
    this.counsellorService.sendMessageToStudent(
      counselorId, receiverId, this.messageContent
    ).subscribe(
      message => {
        if (this.selectedConversation) {
          this.selectedConversation.messages.push(message);
          this.messageContent = '';
        }
      },
      error => console.error('Error sending message:', error)
    );
  }

  markMessageAsRead(messageId: number): void {
    this.counsellorService.markMessageAsRead(messageId).subscribe(
      () => {
        if (this.selectedConversation) {
          this.selectedConversation.messages = this.selectedConversation.messages.map(msg => {
            if (msg.id === messageId) {
              return {...msg, is_read: true};
            }
            return msg;
          });
        }
      },
      error => console.error('Error marking message as read:', error)
    );
  }

  // Journal management
  loadStudentJournals(studentId: number): void {
    this.counsellorService.getStudentJournals(studentId).subscribe(
      journals => {
        this.journalEntries = journals;
      },
      error => console.error('Error loading journals:', error)
    );
  }

  loadStudentJournalsByDateRange(studentId: number): void {
    if (!this.startDate || !this.endDate) {
      this.loadStudentJournals(studentId);
      return;
    }
    
    this.counsellorService.getStudentJournalsByDateRange(
      studentId, this.startDate, this.endDate
    ).subscribe(
      journals => {
        this.journalEntries = journals;
      },
      error => console.error('Error loading journals by date range:', error)
    );
  }

  viewJournalEntry(entryId: number): void {
    this.counsellorService.getJournalEntry(entryId).subscribe(
      journal => {
        this.selectedJournal = journal;
      },
      error => console.error('Error loading journal entry:', error)
    );
  }

  // Mood tracking
  loadMoodOptions(): void {
    this.moodOptions = this.counsellorService.getMoodOptions();
  }

  loadStudentMoods(studentId: number): void {
    this.counsellorService.getStudentMoods(studentId).subscribe(
      moods => {
        // Process mood data for charting
        this.processMoodData(moods);
      },
      error => console.error('Error loading student moods:', error)
    );
  }

  loadStudentMoodsByDateRange(studentId: number): void {
    if (!this.startDate || !this.endDate) {
      this.loadStudentMoods(studentId);
      return;
    }
    
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    
    this.counsellorService.getStudentMoodsByDateRange(
      studentId, startDate, endDate
    ).subscribe(
      moods => {
        this.processMoodData(moods);
      },
      error => console.error('Error loading moods by date range:', error)
    );
  }

  processMoodData(moods: MoodTracker[]): void {
    // Group moods by date for time-series chart
    const moodsByDate = moods.reduce((acc, mood) => {
      const date = new Date(mood.recorded_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {};
      }
      
      const moodType = mood.mood_type;
      acc[date][moodType] = (acc[date][moodType] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);
    
    // Transform for chart
    this.moodChartData = Object.entries(moodsByDate).map(([date, moods]) => ({
      date,
      ...moods
    }));
  }

  // Goals management
  loadStudentGoals(studentId: number): void {
    this.counsellorService.getStudentGoals(studentId).subscribe(
      goals => {
        this.studentGoals = goals;
      },
      error => console.error('Error loading student goals:', error)
    );
  }

  viewGoalDetails(goalId: number): void {
    this.counsellorService.getGoalDetails(goalId).subscribe(
      goal => {
        this.selectedGoal = goal;
      },
      error => console.error('Error loading goal details:', error)
    );
  }

  updateGoalStatus(goalId: number, isCompleted: boolean, progressPercentage: number): void {
    this.counsellorService.updateStudentGoalStatus(
      goalId, isCompleted, progressPercentage
    ).subscribe(
      updatedGoal => {
        this.studentGoals = this.studentGoals.map(goal => {
          if (goal.id === goalId) {
            return updatedGoal;
          }
          return goal;
        });
        
        if (this.selectedGoal?.id === goalId) {
          this.selectedGoal = updatedGoal;
        }
      },
      error => console.error('Error updating goal status:', error)
    );
  }

  // Community management
  loadCommunityPosts(): void {
    this.counsellorService.getAllCommunityPosts().subscribe(
      posts => {
        this.communityPosts = posts;
      },
      error => console.error('Error loading community posts:', error)
    );
  }

  viewPostDetails(post: Post): void {
    this.selectedPost = post;
    this.loadCommentsForPost(post.id);
  }

  loadCommentsForPost(postId: number): void {
    this.counsellorService.getCommentsForPost(postId).subscribe(
      comments => {
        this.postComments = comments;
      },
      error => console.error('Error loading comments:', error)
    );
  }

  createPost(): void {
    if (!this.newPostContent.trim()) {
      return;
    }
    
    this.counsellorService.createCommunityPost(this.newPostContent).subscribe(
      post => {
        this.communityPosts.unshift(post);
        this.newPostContent = '';
      },
      error => console.error('Error creating post:', error)
    );
  }

  addComment(): void {
    if (!this.newCommentContent.trim() || !this.selectedPost) {
      return;
    }
    
    this.counsellorService.addCommentToPost(
      this.selectedPost.id, this.newCommentContent
    ).subscribe(
      comment => {
        this.postComments.push(comment);
        this.newCommentContent = '';
      },
      error => console.error('Error adding comment:', error)
    );
  }

  // Reports
  generateStudentReport(): void {
    if (!this.selectedStudent) {
      return;
    }
    
    const studentId = this.selectedStudent.id || this.selectedStudent.userId || 0;
    this.counsellorService.generateStudentReport(studentId).subscribe(
      report => {
        console.log('Student report generated:', report);
        // Handle report display or download
      },
      error => console.error('Error generating student report:', error)
    );
  }

  generateSummaryReport(): void {
    this.counsellorService.generateSummaryReport(this.selectedFaculty).subscribe(
      report => {
        console.log('Summary report generated:', report);
        // Handle report display or download
      },
      error => console.error('Error generating summary report:', error)
    );
  }
}