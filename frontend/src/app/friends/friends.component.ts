import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FriendsService, Friend, FriendRequest } from '../services/friends.service';
import { AuthService } from '../services/auth.service';
import { Counselor, ProfileService, Seeker, User } from '../services/profile.service';
import { ChatAppService } from '../services/chat-app.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

export interface SentFriendRequest extends FriendRequest {
  receiverId: number;
  receiverName?: string;
  receiverProfileImage?: string;
}

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  currentUser: User | null = null;
  friends: Friend[] = [];
  receivedRequests: FriendRequest[] = [];
  sentRequests: SentFriendRequest[] = [];
  recommendations: User[] = [];
  
  activeTab: 'friends' | 'received' | 'sent' | 'recommendations' = 'friends';
  searchQuery: string = '';
  isLoading: boolean = true;
  selectedFriend: Friend | null = null;
  
  constructor(
    private friendsService: FriendsService,
    private authService: AuthService,
    private profileService: ProfileService,
    private chatService: ChatAppService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.isLoading = true;
    
    this.currentUser = this.authService.getCurrentUser();
    
    this.friendsService.friends$.subscribe(friends => {
      this.friends = friends;
      this.isLoading = false;
    });

    this.friendsService.incomingRequests$.subscribe(requests => {
      this.receivedRequests = requests;
    });

    this.friendsService.outgoingRequests$.subscribe(requests => {
      this.loadSentRequestsInfo(requests);
    });
    
    this.friendsService.recommendations$.subscribe(recommendations => {
      this.recommendations = recommendations;
    });
    
    this.friendsService.loadFriendsList();
    this.friendsService.loadIncomingFriendRequests();
    this.friendsService.loadOutgoingFriendRequests();
    this.friendsService.loadRecommendations();
  }
  
  loadSentRequestsInfo(sentRequests: FriendRequest[]): void {
    this.sentRequests = [];
    sentRequests.forEach(request => {
      this.profileService.getUserProfile(request.receiverId).subscribe(user => {
        const enhancedRequest: SentFriendRequest = {
          ...request,
          receiverName: user.name,
          receiverProfileImage: user.profileImage
        };
        this.sentRequests.push(enhancedRequest);
      });
    });
  }
  
  switchTab(tab: 'friends' | 'received' | 'sent' | 'recommendations'): void {
    this.activeTab = tab;
  }
  
  sendRequest(userId: number): void {
    this.friendsService.sendFriendRequest(userId).subscribe(() => {
      this.recommendations = this.recommendations.filter(r => r.id !== userId);
      this.friendsService.loadIncomingFriendRequests();
      this.friendsService.loadOutgoingFriendRequests();
    });
  }
  
  cancelRequest(request: SentFriendRequest): void {
    if (confirm(`Are you sure you want to cancel your friend request to ${request.receiverName}?`)) {
      this.friendsService.rejectFriendRequest(request.id).subscribe(() => {
        this.sentRequests = this.sentRequests.filter(r => r.id !== request.id);
        this.friendsService.loadRecommendations();
      });
    }
  }
  
  acceptRequest(request: FriendRequest): void {
    this.friendsService.acceptFriendRequest(request.id).subscribe();
  }
  
  rejectRequest(request: FriendRequest): void {
    this.friendsService.rejectFriendRequest(request.id).subscribe();
  }
  
  removeFriend(friend: Friend): void {
    if (confirm(`Are you sure you want to remove ${friend.username} from your friends?`)) {
      this.friendsService.removeFriend(friend.friendId).subscribe();
    }
  }
  
  startChat(friend: Friend): void {
    this.router.navigate(['/chat'], { queryParams: { contactId: friend.friendId } });
  }
  
  viewProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
  }
  
  get filteredFriends(): Friend[] {
    if (!this.searchQuery.trim()) return this.friends;
    return this.friends.filter(friend => 
      friend.username?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  
  matchesFaculty(user: User): boolean {
    if (this.currentUser?.role === 'seeker' && user.role === 'seeker') {
      const seekerUser = user as Seeker;
      const currentSeeker = this.currentUser as Seeker;
      return seekerUser.faculty === currentSeeker.faculty && !!seekerUser.faculty;
    }
    return false;
  }
  
  getRecommendationReason(user: User): string {
    if (this.matchesFaculty(user)) {
      const seekerUser = user as Seeker;
      return `Same faculty: ${seekerUser.faculty}`;
    }
    if (user.role === 'counselor') {
      const counselorUser = user as Counselor;
      return `Counselor specializing in ${counselorUser.specialization || 'mental health'}`;
    }
    const reasons = [
      'Based on similar interests',
      'Active community member',
      'Recommended for you',
      'Popular on Mindscape'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'online': return 'status-online';
      case 'away': return 'status-away';
      case 'offline': return 'status-offline';
      default: return 'status-offline';
    }
  }

  getUserFaculty(user: User): string | undefined {
    if (user.role === 'seeker') {
      return (user as Seeker).faculty;
    }
    return undefined;
  }
  
  refreshRecommendations(): void {
    this.friendsService.loadRecommendations();
  }
}
