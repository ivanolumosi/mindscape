import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService, User, Seeker } from '../services/auth.service';
import { Subscription } from 'rxjs';

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

  // Only seeker navigation items
  seekerNavItems = [
    { route: '/userdash', icon: 'dashboard-icon', label: 'Dashboard' },
    { route: '/profile', icon: 'profile-icon', label: 'Profile' },
    { route: '/journal', icon: 'journal-icon', label: 'Daily Journal' },
    { route: '/chatapp', icon: 'chat-icon', label: 'Chats' },
    { route: '/posts', icon: 'posts-icon', label: 'Posts' },
    { route: '/goals', icon: 'goals-icon', label: 'Goals' },
    { route: '/friends', icon: 'friends-icon', label: 'Friends' },
    { route: '/mood', icon: 'assessment-icon', label: 'Mood' }
  ];

  navItems: any[] = [];

  constructor(private authService: AuthService) {}
  showSidebar = false;
  ngOnInit(): void {
    // Load immediately from localStorage
    this.refreshUserData();

    // Listen for updates from AuthService
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.navItems = this.seekerNavItems;
        this.logCurrentUserDetails(user);
      }
    });
    
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  refreshUserData(): void {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        this.currentUser = userData;
        this.navItems = this.seekerNavItems;
        this.logCurrentUserDetails(userData);

        // Optionally push it into AuthService BehaviorSubject
        if (!this.authService.getCurrentUser()) {
          (this.authService as any).currentUserSubject.next(userData);
        }
      } catch (e) {
        console.error('Error parsing stored user in sidebar:', e);
      }
    }
  }

  logCurrentUserDetails(user: User): void {
    console.log('%c[Sidebar] Logged-in user:', 'color: #4CAF50; font-weight: bold;');
    console.log('🧑 Name:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🛡️ Role:', user.role);
    if ('faculty' in user) {
      console.log('🎓 Faculty:', (user as Seeker).faculty);
    }
  }

  getUserAvatar(): string {
    return (this.currentUser as Seeker)?.profileImage || this.defaultAvatar;
  }

  getUserName(): string {
    return this.currentUser?.name || 'User';
  }

  getUserRoleText(): string {
    const seeker = this.currentUser as Seeker;
    return seeker.faculty ? `${seeker.faculty} Student` : 'Student';
  }
 
  logout(): void {
    this.authService.logout();
  }
}
