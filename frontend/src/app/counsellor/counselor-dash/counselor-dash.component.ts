import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counselor-dash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counselor-dash.component.html',
  styleUrl: './counselor-dash.component.css'
})
export class CounselorDashComponent  implements OnInit {

  counsellorName: string = 'Dr. Sarah Williams';
  currentDate: string = 'Saturday, March 15, 2025';
  notificationCount: number = 3;
  messageCount: number = 2;
  
  upcomingSessions = [
    {
      id: 1,
      title: 'Counseling Session with John Doe',
      date: 'Today',
      timeStart: '2:00 PM',
      timeEnd: '3:00 PM',
      image: 'assets/images/profile.png',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Anxiety Support Group',
      date: 'Tomorrow',
      timeStart: '4:00 PM',
      timeEnd: '5:00 PM',
      image: 'assets/images/group-session.png',
      status: 'upcoming'
    }
  ];

  patientProgress = [
    {
      name: 'Practice mindfulness meditation',
      progress: 80,
      status: '16/20 days'
    },
    {
      name: 'Join a study group',
      progress: 50,
      status: '1/2 completed'
    },
    {
      name: 'Complete sleep assessment',
      progress: 0,
      status: 'Not started'
    }
  ];

  moodTracking = {
    options: [
      { value: 'Great', color: '#1B9D6B' },
      { value: 'Good', color: '#43A78F' },
      { value: 'Okay', color: '#E0BF59' },
      { value: 'Down', color: '#D9B440' },
      { value: 'Bad', color: '#A94242' }
    ],
    selectedMood: null as string | null  
  };
  todaysQuote = {
    quote: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    author: 'Nelson Mandela'
  };

  constructor() { }

  ngOnInit(): void {
  }

  selectMood(mood: string): void {
    this.moodTracking.selectedMood = mood;
  }

  recordMood(): void {
    console.log('Mood recorded:', this.moodTracking.selectedMood);
    // In a real implementation, this would call a service to save the mood
  }

  getAnotherQuote(): void {
    console.log('Getting another quote');
    // In a real implementation, this would fetch a new quote from a service
  }

  joinSession(sessionId: number): void {
    console.log('Joining session:', sessionId);
    // In a real implementation, this would navigate to a session page or launch a video call
  }

  viewAllSessions(): void {
    console.log('Viewing all sessions');
    // In a real implementation, this would navigate to a sessions page
  }

  viewAllGoals(): void {
    console.log('Viewing all goals');
    // In a real implementation, this would navigate to a goals page
  }
}