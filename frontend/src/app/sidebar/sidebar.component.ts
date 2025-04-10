// Updated sidebar.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService, User, Seeker, Counselor } from '../services/profile.service';
import { Subscription, merge } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userSubscription: Subscription | null = null;
  defaultAvatar: string = 'assets/images/user.png';
  
  // Define conditional navigation items for different user roles
  seekerNavItems = [
    { route: '/userdash', icon: 'dashboard-icon', label: 'Dashboard' },
    { route: '/profile', icon: 'profile-icon', label: 'Profile' },
    { route: '/journal', icon: 'journal-icon', label: 'Daily Journal' },
    { route: '/chatapp', icon: 'chat-icon', label: 'Chats' },
    { route: '/posts', icon: 'posts-icon', label: 'posts' },
    { route: '/goals', icon: 'goals-icon', label: 'Goals' },
    { route: '/friends', icon: 'friends-icon', label: 'Friends' },
    { route: '/assessment', icon: 'assessment-icon', label: 'Assessment' },
   
  ];
  
  counselorNavItems = [
    { route: '/userdash', icon: 'dashboard-icon', label: 'Dashboard' },
    { route: '/profile', icon: 'profile-icon', label: 'Profile' },
    { route: '/schedule', icon: 'schedule-icon', label: 'Schedule' },
    { route: '/chatapp', icon: 'chat-icon', label: 'Client Chats' },
    { route: '/reports', icon: 'reports-icon', label: 'Reports' }
  ];
  
  adminNavItems = [
    { route: '/admin', icon: 'dashboard-icon', label: 'Admin Dashboard' },
    { route: '/profile', icon: 'profile-icon', label: 'Profile' },
    { route: '/users', icon: 'users-icon', label: 'Manage Users' },
    { route: '/reports', icon: 'reports-icon', label: 'System Reports' }
  ];
  
  navItems: any[] = [];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Get user data from both services to ensure we catch any updates
    this.userSubscription = this.profileService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.setNavItemsByRole(user.role);
      } else {
        // If no user in profile service, try auth service
        const authUser = this.authService.getCurrentUser();
        if (authUser) {
          this.currentUser = authUser;
          this.setNavItemsByRole(authUser.role);
          // Update profile service to keep in sync
          this.profileService.updateUser(authUser);
        }
      }
    });

    // Force data refresh at sidebar initialization to ensure latest user data
    this.refreshUserData();
  }

  // Method to manually refresh user data
  refreshUserData(): void {
    // Try to get from localStorage first
    const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData) {
          // Update both services with the user data
          this.profileService.updateUser(userData);
        }
      } catch (e) {
        console.error('Error parsing stored user data in sidebar:', e);
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Set navigation items based on user role
  setNavItemsByRole(role: string): void {
    switch (role) {
      case 'counselor':
        this.navItems = this.counselorNavItems;
        break;
      case 'admin':
        this.navItems = this.adminNavItems;
        break;
      case 'seeker':
      default:
        this.navItems = this.seekerNavItems;
        break;
    }
  }

  // Get user's profile image or return default
  getUserAvatar(): string {
    if (!this.currentUser) return this.defaultAvatar;
    
    // Check user role and cast to appropriate type
    if (this.currentUser.role === 'seeker') {
      return (this.currentUser as Seeker).profileImage || this.defaultAvatar;
    } else if (this.currentUser.role === 'counselor') {
      return (this.currentUser as Counselor).profileImage || this.defaultAvatar;
    }
    
    return this.defaultAvatar;
  }

  // Get user's role display text
  getUserRoleText(): string {
    if (!this.currentUser) return '';
    
    const userRole = this.currentUser.role as string;
    
    switch (userRole) {
      case 'seeker':
        // For seekers, show their faculty if available
        const seeker = this.currentUser as Seeker;
        return seeker.faculty ? `${seeker.faculty} Student` : 'Student';
        
      case 'counselor':
        // For counselors, show their specialization if available
        const counselor = this.currentUser as Counselor;
        return counselor.specialization ? `${counselor.specialization} Counselor` : 'Counselor';
      
      case 'admin':
        // For admin users
        return 'Administrator';
        
      default:
        // Safe way to capitalize the first letter of the role
        return userRole.charAt(0).toUpperCase() + userRole.slice(1);
    }
  }

  // Log out the user
  logout(): void {
    this.authService.logout();
  }
}