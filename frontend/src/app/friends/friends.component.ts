import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule,FormsModule,SidebarComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent {
  friendRequests = [
    { id: 1, name: 'Alice Johnson', avatar: 'assets/avatars/alice.jpg' },
    { id: 2, name: 'Bob Smith', avatar: 'assets/avatars/bob.jpg' }
  ];

  // Mock Friends List
  friends = [
    { id: 3, name: 'Charlie Brown', avatar: 'assets/avatars/charlie.jpg' },
    { id: 4, name: 'David White', avatar: 'assets/avatars/david.jpg' }
  ];

  // Mock Friend Recommendations
  recommendedUsers = [
    { id: 5, name: 'Emily Watson', avatar: 'assets/avatars/emily.jpg' },
    { id: 6, name: 'Frank Green', avatar: 'assets/avatars/frank.jpg' }
  ];

  // Send Friend Request
  sendFriendRequest(userId: number) {
    console.log(`Friend request sent to user ${userId}`);
  }

  // Accept Friend Request
  acceptFriendRequest(requestId: number) {
    const acceptedUser = this.friendRequests.find(r => r.id === requestId);
    if (acceptedUser) {
      this.friends.push(acceptedUser);
      this.friendRequests = this.friendRequests.filter(r => r.id !== requestId);
    }
  }

  // Reject Friend Request
  rejectFriendRequest(requestId: number) {
    this.friendRequests = this.friendRequests.filter(r => r.id !== requestId);
  }

  // Remove Friend
  removeFriend(friendId: number) {
    this.friends = this.friends.filter(f => f.id !== friendId);
  }

  // Open Chat with Friend
  openChat(friend: any) {
    console.log(`Opening chat with ${friend.name}`);
  }
}