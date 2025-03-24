import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { Chart } from "c:/Users/zilla/Documents/mindscape/frontend/node_modules/chart.js/dist/types";
import { Chart } from 'chart.js';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {


  
    users: any[] = [];
    filteredUsers: any[] = [];
    
    // Counselor Management
    counselors: any[] = [];
    verificationRequests: any[] = [];
    
    // Crisis Management
    activeCrises: any[] = [];
    crisisHistory: any[] = [];
    
    // Content Moderation
    flaggedContent: any[] = [];
    
    // Notifications
    sentNotifications: any[] = [];
    
    // Charts
    userGrowthChart: any;
    userDistributionChart: any;
    engagementChart: any;
    sessionChart: any;
    responseChart: any;
    satisfactionChart: any;
  
    constructor() { }
  
    ngOnInit(): void {
      this.loadUsers();
      this.loadCounselors();
      this.loadVerificationRequests();
      this.loadCrises();
      this.loadCrisisHistory();
      this.loadFlaggedContent();
      this.loadNotifications();
      
      // Initialize charts after view init
      setTimeout(() => {
        this.initCharts();
      }, 100);
    }
  
    // User Management Methods
    loadUsers(): void {
      // In a real application, this would be a service call
      this.users = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'seeker',
          status: 'active',
          joinDate: '2024-03-15',
          avatar: 'assets/images/1user.png'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'counselor',
          status: 'active',
          joinDate: '2024-02-10',
          avatar: 'assets/images/1user.png'
        },
        {
          id: 3,
          name: 'Robert Johnson',
          email: 'robert.j@example.com',
          role: 'admin',
          status: 'active',
          joinDate: '2023-11-05',
          avatar: 'assets/images/1user.png'
        },
        {
          id: 4,
          name: 'Amanda Lee',
          email: 'amanda.lee@example.com',
          role: 'seeker',
          status: 'inactive',
          joinDate: '2024-01-22',
          avatar: 'assets/images/1user.png'
        },
        {
          id: 5,
          name: 'Dr. Michael Chen',
          email: 'michael.chen@example.com',
          role: 'counselor',
          status: 'pending',
          joinDate: '2024-03-20',
          avatar: 'assets/images/1user.png'
        }
      ];
      
      this.filteredUsers = [...this.users];
    }
  
    filterUsers(role: string, status: string): void {
      this.filteredUsers = this.users.filter(user => {
        let matchesRole = role === 'all' || user.role === role;
        let matchesStatus = status === 'all' || user.status === status;
        return matchesRole && matchesStatus;
      });
    }
  
    addUser(user: any): void {
      this.users.push(user);
      this.filteredUsers = [...this.users];
    }
  
    editUser(userId: number, updatedData: any): void {
      const index = this.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...updatedData };
        this.filteredUsers = [...this.users];
      }
    }
  
    deleteUser(userId: number): void {
      this.users = this.users.filter(u => u.id !== userId);
      this.filteredUsers = [...this.users];
    }
  
    exportUsers(): void {
      // Logic to export users data to CSV or other format
      console.log('Exporting users data...');
    }
  
    // Counselor Management Methods
    loadCounselors(): void {
      this.counselors = [
        {
          id: 1,
          name: 'Dr. Sarah Williams',
          specialization: 'Anxiety & Depression',
          verified: true,
          activeClients: 15,
          sessionsCompleted: 243,
          rating: 4.8,
          avatar: 'assets/images/1user.png'
        },
        {
          id: 2,
          name: 'Dr. James Wilson',
          specialization: 'Trauma Recovery',
          verified: true,
          activeClients: 12,
          sessionsCompleted: 187,
          rating: 4.7,
          avatar: 'assets/images/1user.png'
        },
        {
          id: 3,
          name: 'Dr. Lisa Thompson',
          specialization: 'Family Therapy',
          verified: true,
          activeClients: 8,
          sessionsCompleted: 126,
          rating: 4.9,
          avatar: 'assets/images/1user.png'
        }
      ];
    }
  
    loadVerificationRequests(): void {
      this.verificationRequests = [
        {
          id: 1,
          name: 'Dr. Michael kimemia',
          specialization: 'Cognitive Behavioral Therapy',
          submittedDate: '2024-03-18',
          avatar: 'assets/avatars/user5.png'
        },
        {
          id: 2,
          name: 'Dr. Emily chege',
          specialization: 'Addiction Recovery',
          submittedDate: '2024-03-20',
          avatar: 'assets/avatars/user6.png'
        }
      ];
    }
  
    viewCounselorProfile(counselorId: number): void {
      console.log(`Viewing profile for counselor ID: ${counselorId}`);
    }
  
    viewCounselorSessionHistory(counselorId: number): void {
      console.log(`Viewing session history for counselor ID: ${counselorId}`);
    }
  
    approveCounselor(requestId: number): void {
      console.log(`Approving counselor verification request ID: ${requestId}`);
      this.verificationRequests = this.verificationRequests.filter(r => r.id !== requestId);
      // Logic to add the approved counselor to the counselors list
    }
  
    rejectCounselor(requestId: number): void {
      console.log(`Rejecting counselor verification request ID: ${requestId}`);
      this.verificationRequests = this.verificationRequests.filter(r => r.id !== requestId);
    }
  
    suspendCounselor(counselorId: number): void {
      console.log(`Suspending counselor ID: ${counselorId}`);
      // Logic to update the counselor's status
    }
  
    // Crisis Management Methods
    loadCrises(): void {
      this.activeCrises = [
        {
          id: 1,
          userName: 'Michael kimaru',
          severity: 'high',
          timeElapsed: '42 minutes ago',
          description: 'User reported severe anxiety symptoms and difficulty breathing.',
          tags: ['anxiety', 'panic', 'urgent']
        },
        {
          id: 2,
          userName: 'Jessica nyawira',
          severity: 'medium',
          timeElapsed: '1 hour ago',
          description: 'User expressed feelings of hopelessness and isolation.',
          tags: ['depression', 'isolation']
        },
        {
          id: 3,
          userName: 'David Waithera',
          severity: 'high',
          timeElapsed: '2 hours ago',
          description: 'User mentioned self-harm thoughts and requested immediate support.',
          tags: ['self-harm', 'urgent', 'immediate']
        }
      ];
    }
  
    loadCrisisHistory(): void {
      this.crisisHistory = [
        {
          id: 1,
          userName: 'Alex wako',
          userAvatar: 'assets/images/1user.png',
          issue: 'Panic attack',
          counselor: 'Dr. Sarah Williams',
          resolution: 'resolved',
          date: '2024-03-21'
        },
        {
          id: 2,
          userName: 'Emma mulamba',
          userAvatar: 'assets/images/1user.png',
          issue: 'Suicidal ideation',
          counselor: 'Dr. James Wilson',
          resolution: 'referred',
          date: '2024-03-20'
        },
        {
          id: 3,
          userName: 'Thomas Wange',
          userAvatar: 'assets/images/1user.png',
          issue: 'Severe depression',
          counselor: 'Dr. Lisa Thompson',
          resolution: 'resolved',
          date: '2024-03-19'
        }
      ];
    }
  
    assignCounselor(crisisId: number): void {
      console.log(`Assigning counselor to crisis ID: ${crisisId}`);
      // Logic to show counselor assignment modal/form
    }
  
    viewCrisisDetails(crisisId: number): void {
      console.log(`Viewing details for crisis ID: ${crisisId}`);
      // Logic to show crisis details
    }
  
    viewCrisisReport(crisisId: number): void {
      console.log(`Viewing report for crisis ID: ${crisisId}`);
      // Logic to show crisis resolution report
    }
  
    followUpCrisis(crisisId: number): void {
      console.log(`Creating follow-up for crisis ID: ${crisisId}`);
      // Logic to schedule or create a follow-up
    }
  
    // Content Moderation Methods
    loadFlaggedContent(): void {
      this.flaggedContent = [
        {
          id: 1,
          userName: 'Ryan mwanthis',
          userAvatar: 'assets/images/1user.png',
          date: '2024-03-22',
          text: 'I\'ve been feeling really down lately and sometimes I think about just disappearing. Not sure if anyone would notice or care.',
          flagReason: 'Potentially harmful content'
        },
        {
          id: 2,
          userName: 'Olivia kalaghe',
          userAvatar: 'assets/images/1user.png',
          date: '2024-03-22',
          text: 'The medication my doctor prescribed isn\'t working. I\'m thinking of doubling the dose to see if that helps.',
          flagReason: 'Medical safety concern'
        }
      ];
    }
  
    approveContent(contentId: number): void {
      console.log(`Approving content ID: ${contentId}`);
      this.flaggedContent = this.flaggedContent.filter(c => c.id !== contentId);
    }
  
    editContent(contentId: number): void {
      console.log(`Editing content ID: ${contentId}`);
      // Logic to show content editing form/modal
    }
  
    removeContent(contentId: number): void {
      console.log(`Removing content ID: ${contentId}`);
      this.flaggedContent = this.flaggedContent.filter(c => c.id !== contentId);
    }
  
    // Notification Methods
    loadNotifications(): void {
      this.sentNotifications = [
        {
          id: 1,
          title: 'System Maintenance Notice',
          type: 'maintenance',
          recipients: 'All Users',
          sentDate: '2024-03-20',
          openRate: 78
        },
        {
          id: 2,
          title: 'New Counselors Available',
          type: 'announcement',
          recipients: 'All Seekers',
          sentDate: '2024-03-18',
          openRate: 64
        },
        {
          id: 3,
          title: 'Updated Privacy Policy',
          type: 'system',
          recipients: 'All Users',
          sentDate: '2024-03-15',
          openRate: 52
        }
      ];
    }
  
    sendNotification(notificationData: any): void {
      console.log('Sending notification:', notificationData);
      // Logic to send notification via service
      // Then add to sent notifications list
      const newNotification = {
        id: this.sentNotifications.length + 1,
        ...notificationData,
        sentDate: new Date().toISOString().split('T')[0],
        openRate: 0
      };
      this.sentNotifications.unshift(newNotification);
    }
  
    previewNotification(notificationData: any): void {
      console.log('Previewing notification:', notificationData);
      // Logic to show notification preview
    }
  
    viewNotificationDetails(notificationId: number): void {
      console.log(`Viewing details for notification ID: ${notificationId}`);
      // Logic to show notification details
    }
  
    resendNotification(notificationId: number): void {
      console.log(`Resending notification ID: ${notificationId}`);
      // Logic to resend notification
    }
  
    // Chart initialization methods
    initCharts(): void {
      // this.initUserGrowthChart();
      this.initUserDistributionChart();
      this.initAnalyticsCharts();
    }
  
    initUserGrowthChart(): void {
      const ctx = document.querySelector('.user-growth-chart') as HTMLCanvasElement;
      if (!ctx) return;
      
      this.userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'New Users',
            data: [120, 150, 180, 270, 210, 160],
            borderColor: '#4c78dd',
            backgroundColor: 'rgba(76, 120, 221, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  
    initUserDistributionChart(): void {
      const ctx = document.querySelector('.user-distribution-chart') as HTMLCanvasElement;
      if (!ctx) return;
      
      this.userDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Seekers', 'Counselors', 'Admins'],
          datasets: [{
            data: [65, 30, 5],
            backgroundColor: [
              '#4c78dd',
              '#47b881',
              '#f7b924'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  
    initAnalyticsCharts(): void {
      // Initialize engagement chart
      const engagementCtx = document.querySelector('.engagement-chart') as HTMLCanvasElement;
      if (engagementCtx) {
        this.engagementChart = new Chart(engagementCtx, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
              label: 'Active Users',
              data: [850, 920, 980, 1050],
              borderColor: '#4c78dd',
              backgroundColor: 'rgba(76, 120, 221, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
      
      // Initialize session distribution chart
      const sessionCtx = document.querySelector('.session-chart') as HTMLCanvasElement;
      if (sessionCtx) {
        this.sessionChart = new Chart(sessionCtx, {
          type: 'bar',
          data: {
            labels: ['Anxiety', 'Depression', 'Stress', 'Relationships', 'Other'],
            datasets: [{
              label: 'Sessions',
              data: [65, 59, 80, 45, 30],
              backgroundColor: '#47b881'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
      
      // Initialize response time chart
      const responseCtx = document.querySelector('.response-chart') as HTMLCanvasElement;
      if (responseCtx) {
        this.responseChart = new Chart(responseCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Average Response Time (min)',
              data: [45, 40, 35, 30, 25, 20],
              borderColor: '#f7b924',
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
      
      // Initialize satisfaction chart
      const satisfactionCtx = document.querySelector('.satisfaction-chart') as HTMLCanvasElement;
      if (satisfactionCtx) {
        this.satisfactionChart = new Chart(satisfactionCtx, {
          type: 'bar',
          data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
              label: 'Ratings',
              data: [5, 10, 15, 30, 40],
              backgroundColor: '#4c78dd'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y'
          }
        });
      }
    }
  
    // Settings methods
    saveGeneralSettings(settings: any): void {
      console.log('Saving general settings:', settings);
      // Logic to save settings via service
    }
  
    saveSecuritySettings(settings: any): void {
      console.log('Saving security settings:', settings);
      // Logic to save security settings via service
    }
  
    saveNotificationSettings(settings: any): void {
      console.log('Saving notification settings:', settings);
      // Logic to save notification settings via service
    }
  
    saveBackupSettings(settings: any): void {
      console.log('Saving backup settings:', settings);
      // Logic to save backup settings via service
    }
  
    runManualBackup(): void {
      console.log('Running manual backup...');
      // Logic to trigger backup via service
    }
  
    restoreFromBackup(): void {
      console.log('Initiating restore from backup...');
      // Logic to show backup selection and restore flow
    }
  
    // Navigation methods
    navigateToSection(sectionId: string): void {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          }
        });
      }
    }
  
    logout(): void {
      console.log('Logging out...');
      // Logic to handle logout via auth service
    }
  
    // Helper methods for date formatting, filtering, etc.
    formatDate(date: string): string {
      return new Date(date).toLocaleDateString();
    }
  
    timeSince(dateString: string): string {
      const date = new Date(dateString);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + ' years ago';
      
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + ' months ago';
      
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + ' days ago';
      
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + ' hours ago';
      
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + ' minutes ago';
      
      return Math.floor(seconds) + ' seconds ago';
    }
    scrollToSection(sectionId: string) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  
  }