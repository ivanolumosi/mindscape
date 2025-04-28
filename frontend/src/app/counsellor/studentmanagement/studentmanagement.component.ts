import { Component, OnInit } from '@angular/core';
import { CounsellorManagementService } from '../../services/counsellor-management.service';
import { AuthService, Seeker } from '../../services/auth.service';
import { MoodTracker, MoodStatistic } from '../../services/mood.service';
import { DailyJournal } from '../../services/journal.service';
import { Goal } from '../../services/goal.service';
import { Resource } from '../../services/resource.service';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-studentmanagement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './studentmanagement.component.html',
  styleUrl: './studentmanagement.component.css'
})

export class StudentmanagementComponent implements OnInit {
  
  // All available seekers
  allSeekers: Seeker[] = [];
  
  // Filtered seekers based on search or faculty
  filteredSeekers: Seeker[] = [];
  
  // Currently selected seeker for detailed view
  selectedSeeker: Seeker | null = null;
  
  // Faculty list for filtering
  faculties: string[] = [];
  
  // Current faculty filter
  currentFaculty: string = '';
  
  // Search term for seeker filtering
  searchTerm: string = '';
  
  // Selected date range for data filtering
  dateRange = {
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
    endDate: new Date()  // Today
  };
  
  // Data for selected seeker
  seekerMoods: MoodTracker[] = [];
  seekerMoodStats: MoodStatistic[] = [];
  seekerJournals: DailyJournal[] = [];
  seekerGoals: Goal[] = [];
  seekerCompletedGoals: Goal[] = [];
  seekerPendingGoals: Goal[] = [];
  
  // Recommended resources for seeker
  recommendedResources: Resource[] = [];
  
  // Chat history
  chatHistory: any[] = [];
  newMessage: string = '';
  
  // UI state
  loading = false;
  error: string | null = null;
  activeTab: 'overview' | 'moods' | 'journals' | 'goals' | 'resources' | 'chat' = 'overview';
  
  // Analytics data
  facultyMetrics: any = null;
  overallMoodTrends: any = null;

  constructor(
    private counselorService: CounsellorManagementService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllSeekers();
    this.loadAnalytics();
  }

  // Load all available seekers
  loadAllSeekers(): void {
    this.loading = true;
    this.counselorService.getAllSeekers().subscribe(
      seekers => {
        this.allSeekers = seekers;
        this.filteredSeekers = [...seekers];
        
        // Extract unique faculties for filtering
        this.faculties = [...new Set(seekers.map(s => s.faculty).filter((f): f is string => !!f))];        
        this.loading = false;
      },
      error => {
        console.error('Error loading seekers:', error);
        this.error = 'Failed to load seekers';
        this.loading = false;
      }
    );
  }

  // Load counselor analytics data
  loadAnalytics(): void {
    forkJoin({
      facultyMetrics: this.counselorService.getFacultyMetrics(),
      moodTrends: this.counselorService.getOverallMoodTrends()
    }).subscribe(
      results => {
        this.facultyMetrics = results.facultyMetrics;
        this.overallMoodTrends = results.moodTrends;
      },
      error => {
        console.error('Error loading analytics:', error);
      }
    );
  }

  // Filter seekers by faculty
  filterByFaculty(faculty: string): void {
    this.currentFaculty = faculty;
    this.applyFilters();
  }

  // Filter seekers by search term
  searchSeekers(): void {
    this.applyFilters();
  }

  // Apply all current filters
  applyFilters(): void {
    let filtered = [...this.allSeekers];
    
    // Apply faculty filter if selected
    if (this.currentFaculty) {
      filtered = filtered.filter(s => s.faculty === this.currentFaculty);
    }
  
    // Apply search term if any
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(term) || 
        s.email?.toLowerCase().includes(term)
      );
    }
    
    this.filteredSeekers = filtered;
  }
  createSession() {
    this.router.navigate(['/counsellor-sessions']);
  }
  // Reset all filters
  resetFilters(): void {
    this.currentFaculty = '';
    this.searchTerm = '';
    this.filteredSeekers = [...this.allSeekers];
  }

  // Select a seeker to view detailed information
  selectSeeker(seeker: Seeker): void {
    this.selectedSeeker = seeker;
    this.loadSeekerData();
  }

  // Load all data for the selected seeker
  loadSeekerData(): void {
    if (!this.selectedSeeker || !this.selectedSeeker.id) return;
    
    const seekerId = this.selectedSeeker.id;
    this.loading = true;
    
    // Create a batch of requests
    const requests = {
      moods: this.counselorService.getSeekerMoods(seekerId),
      moodStats: this.counselorService.getSeekerMoodStatistics(seekerId),
      journals: this.counselorService.getSeekerJournalEntries(seekerId),
      goals: this.counselorService.getSeekerGoals(seekerId),
      resources: this.counselorService.getResourcesByType('recommendation'),
      chat: this.counselorService.getSeekerChatHistory(seekerId)
    };
    
    // Execute all requests in parallel
    forkJoin(requests).subscribe(
      result => {
        this.seekerMoods = result.moods;
        this.seekerMoodStats = result.moodStats;
        this.seekerJournals = result.journals;
        this.seekerGoals = result.goals;
        this.recommendedResources = result.resources;
        this.chatHistory = result.chat;
        
        // Split goals by completion status
        this.seekerCompletedGoals = this.seekerGoals.filter(g => g.is_completed);
        this.seekerPendingGoals = this.seekerGoals.filter(g => !g.is_completed);
        
        this.loading = false;
      },
      error => {
        console.error('Error loading seeker data:', error);
        this.error = 'Failed to load seeker data';
        this.loading = false;
      }
    );
  }

  // Filter data by date range
  filterByDateRange(): void {
    if (!this.selectedSeeker || !this.selectedSeeker.id) return;
    
    const seekerId = this.selectedSeeker.id;
    const { startDate, endDate } = this.dateRange;
    
    this.loading = true;
    
    // Load moods for date range
    this.counselorService.getSeekerMoodsByDateRange(seekerId, startDate, endDate)
      .subscribe(
        moods => {
          this.seekerMoods = moods;
          this.loading = false;
        },
        error => {
          console.error('Error loading moods by date range:', error);
          this.error = 'Failed to load mood data';
          this.loading = false;
        }
      );
      
    // Load journals for date range
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    this.counselorService.getSeekerJournalsByDateRange(seekerId, startDateStr, endDateStr)
      .subscribe(
        journals => {
          this.seekerJournals = journals;
        },
        error => {
          console.error('Error loading journals by date range:', error);
        }
      );
  }

  // Send a message to the selected seeker
  sendMessage(): void {
    if (!this.selectedSeeker || !this.selectedSeeker.id || !this.newMessage.trim()) return;
    
    this.counselorService.sendDirectMessageToSeeker(this.selectedSeeker.id, this.newMessage).subscribe(
      response => {
        // Add message to chat history
        this.chatHistory.push({
          senderId: this.authService.getCurrentUserId(),
          content: this.newMessage,
          timestamp: new Date()
        });
        
        // Clear the message input
        this.newMessage = '';
      },
      error => {
        console.error('Error sending message:', error);
        this.error = 'Failed to send message';
      }
    );
  }

  // Find similar users to current seeker (for recommendations)
  findSimilarUsers(): void {
    if (!this.selectedSeeker || !this.selectedSeeker.id) return;
    
    this.loading = true;
    this.counselorService.findSimilarUsersToSeeker(this.selectedSeeker.id).subscribe(
      users => {
        // Process similar users if needed
        console.log('Similar users:', users);
        this.loading = false;
      },
      error => {
        console.error('Error finding similar users:', error);
        this.error = 'Failed to find similar users';
        this.loading = false;
      }
    );
  }

  // Recommend a resource to the selected seeker
  recommendResource(resourceId: number): void {
    if (!this.selectedSeeker || !this.selectedSeeker.id) return;
    
    // Here you would call a method to assign/recommend a resource to a seeker
    // This functionality would need to be added to the counselor service
    console.log(`Recommending resource ${resourceId} to seeker ${this.selectedSeeker.id}`);
    
    // For now, just show a message
    alert(`Resource recommended to ${this.selectedSeeker.name}`);
  }

  // Update start date from event
  updateStartDate(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateRange.startDate = new Date(target.value);
  }
  
  // Update end date from event
  updateEndDate(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateRange.endDate = new Date(target.value);
  }

  // Change active tab
  setActiveTab(tab: 'overview' | 'moods' | 'journals' | 'goals' | 'resources' | 'chat'): void {
    this.activeTab = tab;
  }

  // Get mood distribution for display
  getMoodDistribution(): { name: string; value: number }[] {
    return this.seekerMoodStats.map(stat => ({
      name: stat.mood,
      value: stat.mood_count
    }));
  }

  // Clear any error messages
  clearError(): void {
    this.error = null;
  }
}