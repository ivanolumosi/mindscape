import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatAppService } from '../services/chat-app.service';
import { AuthService, User } from '../services/auth.service';
import { DirectMessage } from '../interfaces/Direct_messages';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface ChatContact {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  unreadCount: number;
  timestamp: Date;
}

interface DisplayMessage {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isOwnMessage: boolean;
}

@Component({
  selector: 'app-chat-app',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './chat-app.component.html',
  styleUrl: './chat-app.component.css'
})
export class ChatAppComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  contacts: ChatContact[] = [];
  selectedContact: ChatContact | null = null;
  messages: DisplayMessage[] = [];
  newMessage: string = '';
  showEmojiPicker: boolean = false;
  
  private messagesSubscription?: Subscription;
  private unreadMessagesSubscription?: Subscription;

  constructor(
    private chatService: ChatAppService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }
    
    // Load unread messages and update contacts
    this.loadUnreadMessages();
    
    // Poll for new unread messages every 30 seconds
    this.unreadMessagesSubscription = interval(30000).pipe(
      switchMap(() => this.chatService.getUnreadMessages())
    ).subscribe(messages => {
      this.updateContactsWithUnreadMessages(messages);
    });
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.unreadMessagesSubscription) {
      this.unreadMessagesSubscription.unsubscribe();
    }
  }

  loadUnreadMessages() {
    this.chatService.getUnreadMessages().subscribe(
      messages => {
        this.updateContactsWithUnreadMessages(messages);
      },
      error => {
        console.error('Error loading unread messages:', error);
      }
    );
  }

  updateContactsWithUnreadMessages(messages: DirectMessage[]) {
    // Group messages by sender
    const messagesBySender = messages.reduce((acc, message) => {
      const userId = message.senderId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(message);
      return acc;
    }, {} as Record<number, DirectMessage[]>);
    
    // Update existing contacts or create new ones
    Object.entries(messagesBySender).forEach(([userId, userMessages]) => {
      const senderId = parseInt(userId);
      const latestMessage = userMessages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      // Find existing contact or create new one
      let contact = this.contacts.find(c => c.id === senderId);
      
      if (contact) {
        contact.lastMessage = latestMessage.content;
        contact.timestamp = new Date(latestMessage.createdAt);
        contact.unreadCount = userMessages.length;
      } else {
        // Create a new contact from the message data
        this.contacts.push({
          id: senderId,
          name: latestMessage.senderName || `User ${senderId}`,
          avatar: latestMessage.senderAvatar || 'assets/images/1user.png',
          status: 'online', // Default status
          lastMessage: latestMessage.content,
          unreadCount: userMessages.length,
          timestamp: new Date(latestMessage.createdAt)
        });
      }
    });
    
    // Sort contacts by latest message time
    this.contacts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // If no contact is selected yet and we have contacts, select the first one
    if (!this.selectedContact && this.contacts.length > 0) {
      this.selectContact(this.contacts[0]);
    }
  }

  selectContact(contact: ChatContact) {
    this.selectedContact = contact;
    // Reset unread count
    contact.unreadCount = 0;
    // Load messages for this contact
    this.loadMessages(contact.id);
    
    // Cancel previous subscription if exists
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    
    // Set up polling for new messages with this contact
    this.messagesSubscription = interval(10000).pipe(
      switchMap(() => this.chatService.getConversation(contact.id))
    ).subscribe(messages => {
      this.updateMessages(messages);
    });
  }

  loadMessages(contactId: number) {
    if (!this.currentUser?.id) {
      console.error('Current user ID not available');
      return;
    }
    
    this.chatService.getConversation(contactId).subscribe(
      messages => {
        this.updateMessages(messages);
        
        // Mark unread messages as read
        messages
          .filter(m => !m.isRead && m.senderId === contactId)
          .forEach(m => {
            this.chatService.markMessageAsRead(m.id).subscribe();
          });
      },
      error => {
        console.error('Error loading messages:', error);
      }
    );
  }

  updateMessages(directMessages: DirectMessage[]) {
    if (!this.currentUser?.id) return;
    
    this.messages = directMessages.map(dm => ({
      id: dm.id,
      senderId: dm.senderId,
      senderName: dm.senderName || `User ${dm.senderId}`,
      content: dm.content,
      timestamp: new Date(dm.createdAt),
      isRead: dm.isRead,
      isOwnMessage: dm.senderId === this.currentUser!.id
    }));
    
    // Sort messages by timestamp
    this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedContact || !this.currentUser?.id) return;
    
    this.chatService.sendDirectMessage(this.selectedContact.id, this.newMessage).subscribe(
      message => {
        // Add the new message to our display
        this.messages.push({
          id: message.id,
          senderId: message.senderId,
          senderName: this.currentUser!.name,
          content: message.content,
          timestamp: new Date(message.createdAt),
          isRead: message.isRead,
          isOwnMessage: true
        });
        
        // Update contact's last message
        if (this.selectedContact) {
          this.selectedContact.lastMessage = message.content;
          this.selectedContact.timestamp = new Date(message.createdAt);
        }
        
        this.newMessage = '';
      },
      error => {
        console.error('Error sending message:', error);
      }
    );
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString();
  }

  deleteConversation() {
    if (!this.selectedContact) return;
    
    if (confirm(`Are you sure you want to delete all messages with ${this.selectedContact.name}?`)) {
      this.chatService.deleteConversation(this.selectedContact.id).subscribe(
        () => {
          // Remove this contact from the list
          this.contacts = this.contacts.filter(c => c.id !== this.selectedContact!.id);
          this.messages = [];
          
          // Select another contact if available
          if (this.contacts.length > 0) {
            this.selectContact(this.contacts[0]);
          } else {
            this.selectedContact = null;
          }
        },
        error => {
          console.error('Error deleting conversation:', error);
        }
      );
    }
  }
}