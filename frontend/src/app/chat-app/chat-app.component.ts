import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';
import { UserprofileService } from '../services/userprofile.service';
import { ChatUser } from '../interfaces/users';
import { DirectMessage } from '../interfaces/Direct_messages';
import { User } from '../services/auth.service';
import { Friend } from '../interfaces/friends';
import { Group } from '../interfaces/groups';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
  selector: 'app-chat-app',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './chat-app.component.html',
  styleUrl: './chat-app.component.css'
})
export class ChatAppComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  // Chat state
  selectedContact: ChatUser | null = null;
  selectedGroup: Group | null = null;
  currentUser: User | null = null;
  messages: DirectMessage[] = [];
  filteredContacts: ChatUser[] = [];
  filteredUsers: User[] = [];
  sharedGroups: Group[] = [];
  unreadCount = { total: 0, conversations: 0 };
  newMessage = '';
  searchQuery = '';
  userSearchQuery = '';
  activeTab = 'all';
  modalTab = 'friends';
  showNewChatModal = false;
  showDeleteModal = false;
  showUserInfo = false;
  showEmojiPicker = false;
  commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '😢', '😎', '🤔', '😁', '😔'];

  // BehaviorSubjects
  private selectedContactSubject = new BehaviorSubject<ChatUser | null>(null);

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private userProfileService: UserprofileService
  ) {}

  ngOnInit(): void {
    // Load current user
    this.currentUser = this.authService.getCurrentUser();
    
    // Load chat list and update unread counts
    this.messageService.loadChatList();
    this.messageService.getUnreadMessageCount();
    this.userProfileService.loadFriendList();
    
    // Subscribe to chat list
    this.messageService.chatList$.subscribe(contacts => {
      this.filterContacts(contacts);
    });
    
    // Subscribe to unread counts
    this.messageService.unreadCount$.subscribe(counts => {
      this.unreadCount = counts;
    });
    
    // Setup message subscription based on selected contact
    this.selectedContactSubject.pipe(
      switchMap(contact => {
        if (contact) {
          return this.messageService.messages$;
        }
        return of([]);
      })
    ).subscribe(messages => {
      this.messages = messages;
    });
  }

  // Contact selection and filtering
  filterContacts(contacts: ChatUser[]): void {
    if (!this.searchQuery) {
      this.filteredContacts = contacts;
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(query) || 
      (contact.nickname && contact.nickname.toLowerCase().includes(query)) ||
      (contact.last_message_content && contact.last_message_content.toLowerCase().includes(query))
    );
  }
  
  selectContact(contact: ChatUser): void {
    this.selectedContact = contact;
    this.selectedContactSubject.next(contact);
    this.messageService.getChatHistory(contact.id);
    
    // Mark messages as read when conversation is opened
    if (contact.has_unread && contact.last_message_id && 
        contact.last_message_sender_id !== this.authService.getCurrentUserId()) {
      this.messageService.markMessageAsRead(contact.last_message_id).subscribe();
    }
    
    // Load shared groups data
    this.loadSharedGroups(contact.id);
  }
  
  async loadSharedGroups(userId: number): Promise<void> {
    // First get all groups the current user is in
    this.messageService.getUserGroups().subscribe(userGroups => {
      // For each group, get members and check if selected user is there
      const groupChecks: Observable<Group | null>[] = userGroups.map(group => 
        this.messageService.getGroupMembers(group.group_id).pipe(
          map(members => {
            const isUserInGroup = members.some(m => m.user_id === userId);
            return isUserInGroup ? group : null;
          })
        )
      );
      
      // Combine results and filter out nulls
      if (groupChecks.length) {
        combineLatest(groupChecks).subscribe(results => {
          this.sharedGroups = results.filter((group): group is Group => group !== null);
        });
      } else {
        this.sharedGroups = [];
      }
    });
  }

  // Message actions
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedContact) return;
    
    this.messageService.sendDirectMessage(
      this.selectedContact.id, 
      this.newMessage.trim()
    ).subscribe(() => {
      // Add message to UI immediately for better UX
      const tempMessage: DirectMessage = {
        id: -1, // Temporary ID
        senderId: this.authService.getCurrentUserId() || 0,
        receiverId: this.selectedContact?.id || 0,
        content: this.newMessage.trim(),
        contentType: 'text',
        createdAt: new Date(),
        isRead: false
      };
      
      this.messages = [...this.messages, tempMessage];
      this.newMessage = '';
    });
  }
  
  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.selectedContact) return;
    
    const file = input.files[0];
    
    // TODO: Implement file upload service
    // For now, we'll simulate with a local message
    const tempMessage: DirectMessage = {
      id: -1,
      senderId: this.authService.getCurrentUserId() || 0,
      receiverId: this.selectedContact.id,
      content: `File: ${file.name}`,
      contentType: 'file',
      mediaUrl: URL.createObjectURL(file), // Temporary local URL
      createdAt: new Date(),
      isRead: false
    };
    
    this.messages = [...this.messages, tempMessage];
    input.value = '';
  }
  
  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }
  
  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }
  
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // Modal actions
  openNewChatModal(): void {
    this.showNewChatModal = true;
    this.loadUsers();
  }
  
  closeNewChatModal(): void {
    this.showNewChatModal = false;
    this.userSearchQuery = '';
  }
  
  confirmDeleteConversation(): void {
    this.showDeleteModal = true;
  }
  
  cancelDelete(): void {
    this.showDeleteModal = false;
  }
  
  deleteConversation(): void {
    // TODO: Implement conversation deletion
    // For now, just remove from UI
    if (this.selectedContact) {
      this.filteredContacts = this.filteredContacts.filter(c => c.id !== this.selectedContact?.id);
      this.selectedContact = null;
      this.showDeleteModal = false;
    }
  }
  
  toggleUserInfo(): void {
    this.showUserInfo = !this.showUserInfo;
  }

  // Tab & filtering actions
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.messageService.chatList$.subscribe(contacts => {
      if (tab === 'all') {
        this.filterContacts(contacts);
      } else if (tab === 'friends') {
        this.filterContacts(contacts.filter(c => c.is_friend));
      }
    });
  }
  
  setModalTab(tab: string): void {
    this.modalTab = tab;
    this.loadUsers();
  }
  
  loadUsers(): void {
    if (this.modalTab === 'friends') {
      this.userProfileService.friends$.subscribe(friends => {
        // Convert friends to users for UI consistency
        this.filteredUsers = friends.map(friend => ({
          id: friend.id,
          name: friend.name,
          email: '', // Not available in friend interface
          role: friend.is_counselor ? 'counselor' : 'seeker',
          profileImage: friend.profile_image,
          nickname: friend.nickname
        }));
      });
    } else {
      // Load suggested users
      this.messageService.findSimilarUsers(10).subscribe(users => {
        this.filteredUsers = users;
      });
    }
  }
  
  startChat(user: User): void {
    // Check if chat already exists
    const existingContact = this.filteredContacts.find(c => c.id === user.id);
    
    if (existingContact) {
      this.selectContact(existingContact);
    } else {
      // Create a new chat contact
      const newContact: ChatUser = {
        id: user.id || 0,
        name: user.name,
        profile_image: user.profileImage,
        role: user.role,
        nickname: user.nickname,
        has_unread: false,
        unread_count: 0,
        is_friend: false, // Will be updated when chat list is refreshed
        is_counselor: user.role === 'counselor',
        status: undefined
      };
      
      this.selectContact(newContact);
    }
    
    this.closeNewChatModal();
  }

  // Friend actions
  sendFriendRequest(userId: number): void {
    this.userProfileService.sendFriendRequest(userId).subscribe(() => {
      // Update UI to reflect pending request
      if (this.selectedContact) {
        // We don't change is_friend yet as it's still a request
        alert('Friend request sent!');
      }
    });
  }
  
  removeFriend(userId: number): void {
    this.userProfileService.removeFriend(userId).subscribe(() => {
      if (this.selectedContact) {
        this.selectedContact = {
          ...this.selectedContact,
          is_friend: false
        };
      }
    });
  }
  
  blockUser(userId: number): void {
    // TODO: Implement user blocking functionality
    alert('User blocked');
    this.toggleUserInfo();
  }

  // Utility methods
  formatTime(date?: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    
    // Same day - show time
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Within last week - show day name
    const daysAgo = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older - show date
    return messageDate.toLocaleDateString();
  }
  
  formatDate(date?: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    
    // Today
    if (now.toDateString() === messageDate.toDateString()) {
      return 'Today';
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
      return 'Yesterday';
    }
    
    // Show full date for older messages
    return messageDate.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  shouldShowDateSeparator(prev: DirectMessage, current: DirectMessage): boolean {
    if (!prev || !current) return false;
    
    const prevDate = new Date(prev.createdAt);
    const currentDate = new Date(current.createdAt);
    
    return prevDate.toDateString() !== currentDate.toDateString();
  }
  
  getStatusText(status: string | any): string {
    if (!status || typeof status !== 'string') {
      return 'Offline';
    }
    
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  
  }
}