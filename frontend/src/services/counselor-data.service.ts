// counselor-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounselorDataService {
  constructor() { }

  // These methods would typically connect to your backend API
  // For now, they return mock data for UI development purposes

  getDashboardStats(): Observable<any> {
    return of({
      totalAppointmentsToday: 5,
      activeClients: 24,
      pendingAssessments: 8
    });
  }

  getTodaySchedule(): Observable<any[]> {
    return of([
      {
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        duration: '60 min',
        clientName: 'John Doe',
        clientPhoto: 'assets/clients/client1.jpg',
        sessionType: 'Initial Assessment',
        status: 'completed'
      },
      {
        startTime: '12:00 PM',
        endTime: '1:00 PM',
        duration: '60 min',
        clientName: 'Emma Johnson',
        clientPhoto: 'assets/clients/client2.jpg',
        sessionType: 'Weekly Session',
        status: 'completed'
      },
      {
        startTime: '2:00 PM',
        endTime: '3:00 PM',
        duration: '60 min',
        clientName: 'Michael Smith',
        clientPhoto: 'assets/clients/client3.jpg',
        sessionType: 'Anxiety Management',
        status: 'upcoming'
      },
      {
        startTime: '4:00 PM',
        endTime: '5:00 PM',
        duration: '60 min',
        clientName: 'Sophia Williams',
        clientPhoto: 'assets/clients/client4.jpg',
        sessionType: 'Family Therapy',
        status: 'upcoming'
      }
    ]);
  }

  getClientMoodData(): Observable<any> {
    return of({
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Great',
          data: [5, 3, 4, 7],
          borderColor: '#4CAF50'
        },
        {
          label: 'Good',
          data: [12, 15, 13, 10],
          borderColor: '#8BC34A'
        },
        {
          label: 'Okay',
          data: [8, 7, 9, 6],
          borderColor: '#FFC107'
        },
        {
          label: 'Down',
          data: [3, 4, 2, 1],
          borderColor: '#FF9800'
        },
        {
          label: 'Bad',
          data: [2, 1, 2, 0],
          borderColor: '#F44336'
        }
      ]
    });
  }

  getRecentMessages(): Observable<any[]> {
    return of([
      {
        senderName: 'John Doe',
        senderPhoto: 'assets/clients/client1.jpg',
        time: '10:30 AM',
        preview: 'Thank you for our session earlier today. I wanted to follow up about the resources you mentioned...',
        read: false
      },
      {
        senderName: 'Emma Johnson',
        senderPhoto: 'assets/clients/client2.jpg',
        time: '9:15 AM',
        preview: 'Ive been practicing the mindfulness exercises we discussed and Im starting to notice some improvements...',
        read: false
      },
      {
        senderName: 'Dr. Robert Chen',
        senderPhoto: 'assets/team/doctor1.jpg',
        time: 'Yesterday',
        preview: 'Im referring a new client to you who might benefit from your approach. Are you accepting new clients?',
        read: true
      }
    ]);
  }

  getSupportGroups(): Observable<any[]> {
    return of([
      {
        name: 'Anxiety Support Group',
        icon: 'fa fa-users',
        schedule: 'Wednesdays at 5:00 PM',
        totalMembers: 12,
        memberPreviews: [
          { photo: 'assets/clients/client1.jpg' },
          { photo: 'assets/clients/client2.jpg' },
          { photo: 'assets/clients/client3.jpg' }
        ]
      },
      {
        name: 'Grief & Loss',
        icon: 'fa fa-heart',
        schedule: 'Mondays at 6:00 PM',
        totalMembers: 8,
        memberPreviews: [
          { photo: 'assets/clients/client4.jpg' },
          { photo: 'assets/clients/client5.jpg' },
          { photo: 'assets/clients/client6.jpg' }
        ]
      }
    ]);
  }

  getClientProgress(): Observable<any[]> {
    return of([
      {
        name: 'John Doe',
        photo: 'assets/clients/client1.jpg',
        focusArea: 'Anxiety Management',
        progressPercentage: 75
      },
      {
        name: 'Emma Johnson',
        photo: 'assets/clients/client2.jpg',
        focusArea: 'Depression',
        progressPercentage: 60
      },
      {
        name: 'Michael Smith',
        photo: 'assets/clients/client3.jpg',
        focusArea: 'Stress Reduction',
        progressPercentage: 40
      }
    ]);
  }

  getAssessmentsDue(): Observable<any[]> {
    return of([
      {
        clientName: 'Sophia Williams',
        clientPhoto: 'assets/clients/client4.jpg',
        assessmentType: 'GAD-7 Anxiety',
        dueDate: 'March 20, 2025',
        status: 'upcoming'
      },
      {
        clientName: 'Emma Johnson',
        clientPhoto: 'assets/clients/client2.jpg',
        assessmentType: 'PHQ-9 Depression',
        dueDate: 'Today',
        status: 'today'
      },
      {
        clientName: 'Michael Smith',
        clientPhoto: 'assets/clients/client3.jpg',
        assessmentType: 'Quality of Life',
        dueDate: 'March 15, 2025',
        status: 'overdue'
      }
    ]);
  }
}