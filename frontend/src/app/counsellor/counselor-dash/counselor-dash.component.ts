import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counsellor-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './counselor-dash.component.html',
  styleUrls: ['./counselor-dash.component.css'],
})
export class CounselorDashComponent implements OnInit {
  slideDirection: 'left' | 'right' | '' = '';
  currentPath = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Track current route to determine slide direction
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const newPath = event.urlAfterRedirects;
      
      // Set slide direction based on navigation
      if (this.currentPath === '/counsellor-students' && newPath === '/counsellor-sessions') {
        this.slideDirection = 'left';
      } else if (this.currentPath === '/counsellor-sessions' && newPath === '/counsellor-students') {
        this.slideDirection = 'right';
      } else {
        this.slideDirection = '';
      }
      
      // Update current path after animation triggers
      setTimeout(() => {
        this.currentPath = newPath;
        this.slideDirection = '';
      }, 300); // Match this with the CSS transition duration
    });
    
    // Initialize currentPath
    this.currentPath = this.router.url;
  }

  // Navigate with animation
  navigateTo(destination: 'students' | 'sessions'): void {
    if (destination === 'students' && this.currentPath !== '/counsellor-students') {
      this.slideDirection = 'right';
      this.router.navigate(['/counsellor-students']);
    } else if (destination === 'sessions' && this.currentPath !== '/counsellor-sessions') {
      this.slideDirection = 'left';
      this.router.navigate(['/counsellor-sessions']);
    }
  }

  // Logout function
  logout(): void {
    const logoutResult = this.authService.logout();
    
    // if (logoutResult && 'subscribe' in logoutResult) {
    //   // If it's an Observable, subscribe to it
    //   logoutResult.subscribe({
    //     next: () => {
    //       this.router.navigate(['/login']);
    //     },
    //     error: (error: any) => {
    //       console.error('Logout error:', error);
    //       this.router.navigate(['/login']);
    //     }
    //   });
    // } else {
      // If it's not an Observable, just navigate to login
      this.router.navigate(['/login']);
    }
  }
