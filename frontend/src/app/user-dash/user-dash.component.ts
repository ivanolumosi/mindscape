import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService, User, Seeker, Counselor } from '../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

interface Mood {
  value: string;
  label: string;
}

interface Quote {
  text: string;
  author: string;
}

interface Session {
  id: string;
  title: string;
  counselorName: string;
  counselorImage: string;
  date: Date;
  time: string;
}

interface Goal {
  id: string;
  title: string;
  progressPercentage: number;
  progressText: string;
}

interface CommunityPost {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  timeAgo: string;
  likes: number;
  comments: number;
}

interface Assessment {
  id: string;
  title: string;
  type: string;
  questions: number;
  duration: string;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  duration: string;
}

@Component({
  selector: 'app-user-dash',
  standalone: true,
  imports: [ SidebarComponent, CommonModule, RouterLink, DatePipe],
  templateUrl: './user-dash.component.html',
  styleUrl: './user-dash.component.css'
})
export class UserDashComponent implements OnInit, OnDestroy {
  // User data
  currentUser: User | null = null;
  userSubscription: Subscription | null = null;
  userRole: string = '';
  welcomeMessage: string = '';
  isLoading: boolean = true;
  today: Date = new Date();
  selectedMood: string | null = null;
  
  // Dashboard data
  moods: Mood[] = [
    { value: 'great', label: 'Great' },
    { value: 'good', label: 'Good' },
    { value: 'okay', label: 'Okay' },
    { value: 'down', label: 'Down' },
    { value: 'bad', label: 'Bad' }
  ];
  
  quote: Quote = {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  };
  
  sessions: Session[] = [
    {
      id: '1',
      title: 'Counseling Session with Dr. Sarah Williams',
      counselorName: 'Dr. Sarah Williams',
      counselorImage: 'assets/images/avatar1.png',
      date: new Date(),
      time: '2:00 PM - 3:00 PM'
    },
    {
      id: '2',
      title: 'Anxiety Support Group',
      counselorName: 'Group Session',
      counselorImage: 'assets/images/1group.jpeg',
      date: new Date(Date.now() + 86400000), // tomorrow
      time: '4:00 PM - 5:00 PM'
    }
  ];
  
  goals: Goal[] = [
    {
      id: '1',
      title: 'Practice mindfulness meditation',
      progressPercentage: 80,
      progressText: '16/20 days'
    },
    {
      id: '2',
      title: 'Join a study group',
      progressPercentage: 50,
      progressText: '1/2 completed'
    },
    {
      id: '3',
      title: 'Complete sleep assessment',
      progressPercentage: 0,
      progressText: 'Not started'
    }
  ];
  
  journalMessage: string = "You haven't written in your journal today. Taking a few minutes to reflect can help improve your mental wellbeing.";
  
  communityPosts: CommunityPost[] = [
    {
      id: '1',
      userName: 'Jane Smith',
      userAvatar: 'assets/images/avatar1.png',
      content: 'Just wanted to share that I passed my exams after struggling with test anxiety. The strategies I learned from the stress management workshop really helped!',
      timeAgo: '2 hours ago',
      likes: 24,
      comments: 8
    }
  ];
  
  assessments: Assessment[] = [
    {
      id: '1',
      title: 'Stress Assessment',
      type: 'stress',
      questions: 15,
      duration: '5'
    },
    {
      id: '2',
      title: 'Sleep Quality Check',
      type: 'sleep',
      questions: 10,
      duration: '3'
    }
  ];
  
  resources: Resource[] = [
    {
      id: '1',
      title: 'Managing Exam Stress',
      type: 'article',
      duration: '5 min read'
    },
    {
      id: '2',
      title: '5-Minute Mindfulness Exercise',
      type: 'video',
      duration: '5 min'
    },
    {
      id: '3',
      title: 'Guided Sleep Meditation',
      type: 'audio',
      duration: '10 min'
    }
  ];
  
  constructor(
    private authService: AuthService,
    private router: Router // Inject Router directly
  ) {}
  
  ngOnInit(): void {
    console.log('UserDashComponent initialized');
    
    // Subscribe to the currentUser$ observable
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('UserDash received user update:', user);
      if (user) {
        this.currentUser = user;
        this.userRole = user.role;
        this.setWelcomeMessage();
      } else {
        // If no user in observable, try to get from auth service or storage
        this.loadUserData();
      }
      this.isLoading = false;
    });
    
    // Initial load in case the subscription doesn't fire immediately
    this.loadUserData();
    
    // Check if user has journaled today
    this.checkJournalStatus();
  }
  
  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  
  private loadUserData(): void {
    // Try getting user from auth service directly
    const user = this.authService.getCurrentUser();
    if (user) {
      console.log('UserDash loaded user from service:', user);
      this.currentUser = user;
      this.userRole = user.role;
      this.setWelcomeMessage();
      this.isLoading = false;
      return;
    }
    
    // If not available, try loading from storage
    const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('UserDash loaded user from storage:', userData);
        this.currentUser = userData;
        this.userRole = userData.role;
        this.setWelcomeMessage();
      } catch (e) {
        console.error('Error parsing user data in UserDash:', e);
      }
    }
    
    this.isLoading = false;
  }
  
  private setWelcomeMessage(): void {
    if (!this.currentUser) {
      this.welcomeMessage = 'Welcome to MindScape!';
      return;
    }
    
    // Create personalized welcome message
    const currentHour = new Date().getHours();
    let greeting = 'Welcome';
    
    if (currentHour < 12) {
      greeting = 'Good morning';
    } else if (currentHour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    this.welcomeMessage = `${greeting}, ${this.currentUser.name}!`;
    
    // Add role-specific content
    if (this.userRole === 'seeker') {
      if ((this.currentUser as Seeker).faculty) {
        this.welcomeMessage += ` How are your studies in ${(this.currentUser as Seeker).faculty} going today?`;
      } else {
        this.welcomeMessage += ' How are you feeling today?';
      }
    } else if (this.userRole === 'counselor') {
      this.welcomeMessage += ' Your students are waiting for guidance.';
    } else if (this.userRole === 'admin') {
      this.welcomeMessage += ' The system is running smoothly.';
    }
  }
  
  // Get user profile completion status
  isProfileComplete(): boolean {
    return this.currentUser?.isProfileComplete || false;
  }
  
  // Route to profile completion if needed
  completeProfile(): void {
    this.router.navigate(['/profile'], { 
      queryParams: { 
        firstLogin: 'true',
        userId: this.currentUser?.id || this.currentUser?.userId
      }
    });
  }
  
  // Mood tracking
  selectMood(mood: string): void {
    this.selectedMood = mood;
  }
  
  recordMood(): void {
    if (!this.selectedMood) {
      // Could show an alert or toast here
      console.log('Please select a mood first');
      return;
    }
    
    console.log(`Mood recorded: ${this.selectedMood}`);
    // Here you would typically send this to your backend service
    // moodService.recordMood(this.selectedMood, new Date());
    
    // For demo, just reset after recording
    this.selectedMood = null;
  }
  
  // Quote functionality
  getNewQuote(): void {
    // In a real app, this would fetch from a service
    const quotes = [
      { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
      { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" }
    ];
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    this.quote = quotes[randomIndex];
  }
  
  // Journal check
  private checkJournalStatus(): void {
    // In a real app, this would check if the user has journaled today
    const hasJournaledToday = false; // This would come from a service
    
    if (hasJournaledToday) {
      this.journalMessage = "You've written in your journal today. Great job maintaining your mental well-being!";
    } else {
      this.journalMessage = "You haven't written in your journal today. Taking a few minutes to reflect can help improve your mental wellbeing.";
    }
  }
  
  // Session functionality
  joinSession(session: Session): void {
    // Navigate to the session or launch a video call
    console.log(`Joining session: ${session.title}`);
    this.router.navigate(['/sessions', session.id]);
  }
  
  // Community functionality
  likePost(post: CommunityPost): void {
    // In a real app, this would call a service
    post.likes++;
  }
  
  viewComments(post: CommunityPost): void {
    this.router.navigate(['/community', post.id]);
  }
  
  // Assessment functionality
  startAssessment(assessment: Assessment): void {
    this.router.navigate(['/assessments', assessment.id]);
  }
}