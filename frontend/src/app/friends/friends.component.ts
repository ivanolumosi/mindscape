import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FriendsService, Friend, FriendRequest } from '../services/friends.service';
import { AuthService } from '../services/auth.service';
import { Counselor, ProfileService, Seeker, User } from '../services/profile.service';
import { ChatAppService } from '../services/chat-app.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

// Extended interface to include receiver info
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
    
    // Get current user and log to console
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current logged in user:', this.currentUser);
    
    // Load friends list
    this.friendsService.friends$.subscribe(friends => {
      this.friends = friends;
      this.isLoading = false;
      console.log('Friends loaded:', friends);
    });
    
    // Load friend requests and separate them into received and sent
    this.friendsService.friendRequests$.subscribe(requests => {
      // Filter requests where the current user is the receiver (incoming/received requests)
      this.receivedRequests = requests.filter(req => 
        req.receiverId === this.currentUser?.id || req.receiverId === this.currentUser?.userId
      );
      
      // Process sent requests (where current user is the sender)
      const sentReqs = requests.filter(req => 
        req.senderId === this.currentUser?.id || req.senderId === this.currentUser?.userId
      );
      
      // Enhance sent requests with receiver info
      this.loadSentRequestsInfo(sentReqs);
      
      console.log('Received requests:', this.receivedRequests);
      console.log('Sent requests:', this.sentRequests);
    });
    
    // Load recommendations
    this.friendsService.recommendations$.subscribe(recommendations => {
      this.recommendations = recommendations;
      console.log('Recommendations loaded:', recommendations);
    });
    
    // Initial load of data
    this.friendsService.loadFriendsList();
    this.friendsService.loadFriendRequests();
    this.friendsService.loadRecommendations();
  }
  
  // Load additional info for sent requests
  loadSentRequestsInfo(sentRequests: FriendRequest[]): void {
    this.sentRequests = [];
    
    sentRequests.forEach(request => {
      // Get receiver details for each sent request
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
  
  // Switch between tabs
  switchTab(tab: 'friends' | 'received' | 'sent' | 'recommendations'): void {
    this.activeTab = tab;
    console.log(`Switched to ${tab} tab`);
  }
  
  // Send a friend request
  sendRequest(userId: number): void {
    console.log(`Sending friend request to user ${userId}`);
    this.friendsService.sendFriendRequest(userId).subscribe(() => {
      // Find the user in recommendations and mark as requested
      const index = this.recommendations.findIndex(r => r.id === userId);
      if (index >= 0) {
        this.recommendations = this.recommendations.filter(r => r.id !== userId);
      }
      
      // Reload sent requests
      this.friendsService.loadFriendRequests();
    });
  }
  
  // Cancel a sent friend request
  cancelRequest(request: SentFriendRequest): void {
    if (confirm(`Are you sure you want to cancel your friend request to ${request.receiverName}?`)) {
      console.log(`Canceling friend request ${request.id}`);
      this.friendsService.rejectFriendRequest(request.id).subscribe(() => {
        // Remove from sent requests
        this.sentRequests = this.sentRequests.filter(r => r.id !== request.id);
        
        // Add back to recommendations if applicable
        this.friendsService.loadRecommendations();
      });
    }
  }
  
  // Accept a friend request
  acceptRequest(request: FriendRequest): void {
    console.log(`Accepting friend request ${request.id}`);
    this.friendsService.acceptFriendRequest(request.id).subscribe();
  }
  
  // Reject a friend request
  rejectRequest(request: FriendRequest): void {
    console.log(`Rejecting friend request ${request.id}`);
    this.friendsService.rejectFriendRequest(request.id).subscribe();
  }
  
  // Remove a friend
  removeFriend(friend: Friend): void {
    if (confirm(`Are you sure you want to remove ${friend.name} from your friends?`)) {
      console.log(`Removing friend ${friend.friendId}`);
      this.friendsService.removeFriend(friend.friendId).subscribe();
    }
  }
  
  // Start a chat with a friend
  startChat(friend: Friend): void {
    console.log(`Starting chat with friend ${friend.friendId}`);
    // Navigate to chat app with this friend selected
    this.router.navigate(['/chat'], { queryParams: { contactId: friend.friendId } });
  }
  
  // View a friend's profile
  viewProfile(userId: number): void {
    console.log(`Viewing profile of user ${userId}`);
    this.router.navigate(['/profile', userId]);
  }
  
  // Filter friends based on search query
  get filteredFriends(): Friend[] {
    if (!this.searchQuery.trim()) return this.friends;
    return this.friends.filter(friend => 
      friend.name?.toLowerCase().includes(this.searchQuery.toLowerCase())
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
  
  // Fix for getRecommendationReason method
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
  
  // Get appropriate status label
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
  // Refresh recommendations
  refreshRecommendations(): void {
    this.friendsService.loadRecommendations();
  }
}