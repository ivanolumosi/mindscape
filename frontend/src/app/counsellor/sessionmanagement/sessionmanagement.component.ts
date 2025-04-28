import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CounsellorDashService } from '../../services/counsellor-dash.service';

interface Session {
  id: number;
  counselorId: number;
  title: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  maxParticipants: number;
  currentParticipants?: number;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface AvailabilitySlot {
  id?: number;
  counselorId: number;
  day: string;
  startTime: string;
  endTime: string;
}

interface WeeklyScheduleSlot {
  day: string;
  slots: {
    startTime: string;
    endTime: string;
    sessionTitle?: string;
    isAvailable: boolean;
    sessionId?: number;
  }[];
}

interface DataSource {
  data: Session[];
}

@Component({
  selector: 'app-sessionmanagement',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './sessionmanagement.component.html',
  styleUrl: './sessionmanagement.component.css'
})
export class SessionmanagementComponent implements OnInit {
  loading = false;
  counselorId: number = 0;
  
  // Sessions list
  sessions: Session[] = [];
  displayedColumns: string[] = ['title', 'date', 'time', 'venue', 'participants', 'status', 'actions'];
  dataSource: DataSource = { data: [] };
  
  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  totalPages = 1;
  
  // Weekly timetable
  weeklySchedule: WeeklyScheduleSlot[] = [];
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeSlots: string[] = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  // Forms
  sessionForm: FormGroup;
  availabilityForm: FormGroup;
  
  // Tab control
  activeTab: 'sessions' | 'schedule' | 'availability' = 'sessions';
  
  // Session detail view
  selectedSession: Session | null = null;
  
  // Availability data storage
  availabilityData: AvailabilitySlot[] = [];

  constructor(
    private counsellorService: CounsellorDashService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Initialize session form
    this.sessionForm = this.fb.group({
      title: ['', [Validators.required]],
      venue: ['', [Validators.required]],
      date: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      description: ['', [Validators.required]],
      maxParticipants: [10, [Validators.required, Validators.min(1)]]
    });
    
    // Initialize availability form
    this.availabilityForm = this.fb.group({
      day: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get the current counselor ID
    this.counselorId = this.authService.getCurrentUserId() || 0;
    
    if (this.counselorId) {
      this.loadCounselorSessions();
      this.loadWeeklyTimetable();
      this.loadAvailabilityData();
    } else {
      this.showAlert('Error: Unable to identify counselor account');
    }
  }

  loadCounselorSessions(): void {
    this.loading = true;
    this.counsellorService.viewCounselorSessions(this.counselorId).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        // Add session status based on date (this would typically come from backend)
        this.sessions = sessions.map(session => {
          const sessionDate = new Date(session.date);
          const now = new Date();
          
          let status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          
          if (sessionDate > now) {
            status = 'scheduled';
          } else if (sessionDate.toDateString() === now.toDateString()) {
            // Check if current time is between start and end time
            const sessionStart = new Date(`${session.date}T${session.startTime}`);
            const sessionEnd = new Date(`${session.date}T${session.endTime}`);
            
            if (now >= sessionStart && now <= sessionEnd) {
              status = 'in-progress';
            } else if (now > sessionEnd) {
              status = 'completed';
            } else {
              status = 'scheduled';
            }
          } else {
            status = 'completed';
          }
          
          return {
            ...session,
            status,
            // This would come from backend in a real implementation
            currentParticipants: Math.floor(Math.random() * session.maxParticipants)
          };
        });
        
        this.dataSource.data = this.sessions;
        this.totalItems = this.sessions.length;
        this.calculateTotalPages();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.showAlert('Error loading sessions. Please try again.');
        this.loading = false;
      }
    });
  }

  loadWeeklyTimetable(): void {
    this.loading = true;
    this.counsellorService.getWeeklyTimetable(this.counselorId).subscribe({
      next: (timetable) => {
        // Process timetable data for display
        this.weeklySchedule = this.weekDays.map(day => {
          const daySlots = timetable.filter(slot => slot.day === day);
          
          return {
            day,
            slots: this.timeSlots.map(time => {
              const matchingSlot = daySlots.find(slot => 
                slot.startTime <= time && slot.endTime > time
              );
              
              return {
                startTime: time,
                endTime: this.getNextHour(time),
                isAvailable: !!matchingSlot,
                sessionTitle: matchingSlot?.sessionTitle,
                sessionId: matchingSlot?.id
              };
            })
          };
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading timetable:', error);
        this.showAlert('Error loading weekly schedule. Please try again.');
        this.loading = false;
      }
    });
  }

  loadAvailabilityData(): void {
    // this.loading = true;
    // this.counsellorService.getCounselorAvailability(this.counselorId).subscribe({
    //   next: (availability) => {
    //     this.availabilityData = availability;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading availability:', error);
    //     this.showAlert('Error loading availability data. Please try again.');
    //     this.loading = false;
    //   }
    // });
  }

  getNextHour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const nextHour = (hours + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getSlotStatus(day: string, timeSlot: string): { isAvailable: boolean, sessionTitle?: string, sessionId?: number } | null {
    const daySchedule = this.weeklySchedule.find(schedule => schedule.day === day);
    if (!daySchedule) return null;
    
    const slot = daySchedule.slots.find(slot => slot.startTime === timeSlot);
    return slot || null;
  }

  // Missing method implementation - Handling time slot clicks
  handleTimeSlotClick(day: string, timeSlot: string): void {
    const slot = this.getSlotStatus(day, timeSlot);
    if (!slot) return;
    
    if (slot.sessionId) {
      // Find the corresponding session
      const session = this.sessions.find(s => s.id === slot.sessionId);
      if (session) {
        this.viewSessionDetails(session);
      }
    } else if (slot.isAvailable) {
      // Pre-fill the session form with this time slot
      this.activeTab = 'sessions';
      this.selectedSession = null;
      this.sessionForm.patchValue({
        date: this.formatDateForInput(new Date()), // Set to current date
        startTime: timeSlot,
        endTime: this.getNextHour(timeSlot)
      });
    } else {
      // Switch to availability tab to set availability
      this.activeTab = 'availability';
      this.availabilityForm.patchValue({
        day: day,
        startTime: timeSlot,
        endTime: this.getNextHour(timeSlot)
      });
    }
  }

  // Helper method to format date for input field
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Method to create a session
  createSession(): void {
    if (this.sessionForm.invalid) {
      this.showAlert('Please complete all required fields');
      return;
    }
    
    const sessionData = {
      counselorId: this.counselorId,
      ...this.sessionForm.value
    };
    
    this.loading = true;
    this.counsellorService.scheduleSession(sessionData).subscribe({
      next: (response) => {
        this.showAlert('Session scheduled successfully');
        this.loadCounselorSessions();
        this.sessionForm.reset();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error scheduling session:', error);
        this.showAlert('Error scheduling session. Please try again.');
        this.loading = false;
      }
    });
  }

  // Method to cancel a session
  cancelSession(sessionId: number): void {
    if (confirm('Are you sure you want to cancel this session?')) {
      this.loading = true;
      this.counsellorService.cancelSession(sessionId, this.counselorId).subscribe({
        next: () => {
          this.showAlert('Session cancelled successfully');
          this.loadCounselorSessions();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cancelling session:', error);
          this.showAlert('Error cancelling session. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  // Method to set availability
  setAvailability(): void {
    if (this.availabilityForm.invalid) {
      this.showAlert('Please complete all required fields');
      return;
    }
    
    const { day, startTime, endTime } = this.availabilityForm.value;
    
    this.loading = true;
    this.counsellorService.setCounselorAvailability(
      this.counselorId, 
      day, 
      startTime, 
      endTime
    ).subscribe({
      next: () => {
        this.showAlert('Availability set successfully');
        this.loadWeeklyTimetable();
        this.availabilityForm.reset();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error setting availability:', error);
        this.showAlert('Error setting availability. Please try again.');
        this.loading = false;
      }
    });
  }

  // Method to check time validity
  checkTimeValidity(): boolean {
    const startTime = this.availabilityForm.get('startTime')?.value;
    const endTime = this.availabilityForm.get('endTime')?.value;
    
    if (!startTime || !endTime) return true;
    
    return startTime < endTime;
  }

  // Method to view session details
  viewSessionDetails(session: Session): void {
    this.selectedSession = session;
  }

  // Method to close session details
  closeSessionDetails(): void {
    this.selectedSession = null;
  }

  // Method to switch tabs
  switchTab(tab: 'sessions' | 'schedule' | 'availability'): void {
    this.activeTab = tab;
  }

  // Method to get CSS class based on status
  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  // Pagination methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  getPageArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Show at most 5 page numbers
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Data sorting method
  sortData(column: string): void {
    // Implementation would depend on your sorting requirements
    const data = [...this.dataSource.data];
    
    data.sort((a, b) => {
      if (column === 'title') {
        return a.title.localeCompare(b.title);
      } else if (column === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (column === 'status') {
        return a.status?.localeCompare(b.status || '') || 0;
      }
      return 0;
    });
    
    this.dataSource.data = data;
  }

  // Get availability slots for a specific day
  getDayAvailability(day: string): AvailabilitySlot[] {
    return this.availabilityData.filter(slot => slot.day === day);
  }

  // Remove availability slot
  removeAvailability(slotId?: number): void {
    if (!slotId) return;
    
    if (confirm('Are you sure you want to remove this availability slot?')) {
      // Mock implementation - in a real app, you'd call a service method
      this.availabilityData = this.availabilityData.filter(slot => slot.id !== slotId);
      this.loadWeeklyTimetable(); // Refresh the timetable view
      this.showAlert('Availability removed successfully');
    }
  }

  // Navigate to students management page
  navigateToStudents(): void {
    this.router.navigate(['/counsellor-students']);
  }

  // Logout method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showAlert(message: string): void {
    // Simple alert for now
    alert(message);
  }
}