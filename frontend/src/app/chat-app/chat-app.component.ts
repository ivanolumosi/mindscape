import { CommonModule } from '@angular/common';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isOwnMessage: boolean;
}

interface ChatContact {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  unreadCount: number;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-app',
  standalone: true,
  imports: [CommonModule,FormsModule,SidebarComponent],
  templateUrl: './chat-app.component.html',
  styleUrl: './chat-app.component.css'
})
export class ChatAppComponent implements OnInit {
  currentUser = {
    id: 1,
    name: 'John Doe',
    avatar: 'assets/images/1user.png'
  };

  contacts: ChatContact[] = [
    {
      id: 2,
      name: 'Dr. Sarah Williams',
      avatar: 'assets/images/1user.png',
      status: 'online',
      lastMessage: 'Looking forward to our session today at 2:00 PM',
      unreadCount: 2,
      timestamp: new Date('2025-03-17T10:30:00')
    },
    {
      id: 3,
      name: 'Anxiety Support Group',
      avatar: 'assets/images/1group.jpeg',
      status: 'online',
      lastMessage: 'David: Does anyone have tips for managing anxiety before presentations?',
      unreadCount: 5,
      timestamp: new Date('2025-03-17T09:15:00')
    },
    {
      id: 4,
      name: 'Emma Johnson',
      avatar: 'assets/images/1user.png',
      status: 'away',
      lastMessage: 'Thanks for sharing that resource!',
      unreadCount: 0,
      timestamp: new Date('2025-03-16T18:45:00')
    },
    {
      id: 5,
      name: 'Mindfulness Group',
      avatar: 'assets/images/1group.jpeg',
      status: 'online',
      lastMessage: 'Rachel: Here\'s the link to the guided meditation we discussed',
      unreadCount: 0,
      timestamp: new Date('2025-03-16T14:20:00')
    },
    {
      id: 6,
      name: 'Support Counselor',
      avatar: 'assets/images/1user.png',
      status: 'online',
      lastMessage: 'Hello John, how can I help you today?',
      unreadCount: 1,
      timestamp: new Date('2025-03-17T11:05:00')
    }
  ];

  selectedContact: ChatContact = this.contacts[0];
  messages: Message[] = [];
  newMessage: string = '';
  showEmojiPicker: boolean = false;

  ngOnInit() {
    // Load dummy messages for the selected contact
    this.loadMessages(this.selectedContact.id);
  }

  loadMessages(contactId: number) {
    // In a real app, you would fetch messages from a service
    this.messages = [
      {
        id: 1,
        senderId: 2,
        senderName: 'Dr. Sarah Williams',
        content: 'Good morning John! How have you been feeling since our last session?',
        timestamp: new Date('2025-03-17T09:30:00'),
        isRead: true,
        isOwnMessage: false
      },
      {
        id: 2,
        senderId: 1,
        senderName: 'John Doe',
        content: 'Hi Dr. Williams. I\'ve been practicing the mindfulness techniques you suggested, and they\'ve been helping with my anxiety.',
        timestamp: new Date('2025-03-17T09:32:00'),
        isRead: true,
        isOwnMessage: true
      },
      {
        id: 3,
        senderId: 2,
        senderName: 'Dr. Sarah Williams',
        content: 'That\'s wonderful to hear! Which technique did you find most effective?',
        timestamp: new Date('2025-03-17T09:33:00'),
        isRead: true,
        isOwnMessage: false
      },
      {
        id: 4,
        senderId: 1,
        senderName: 'John Doe',
        content: 'The breathing exercises really helped when I felt overwhelmed. I also tried the body scan meditation before bed, and it improved my sleep quality.',
        timestamp: new Date('2025-03-17T09:35:00'),
        isRead: true,
        isOwnMessage: true
      },
      {
        id: 5,
        senderId: 2,
        senderName: 'Dr. Sarah Williams',
        content: 'I\'m glad those techniques are working for you. For our session today, I\'d like to discuss how we can build on this progress. Is there anything specific you\'d like to focus on?',
        timestamp: new Date('2025-03-17T09:40:00'),
        isRead: false,
        isOwnMessage: false
      },
      {
        id: 6,
        senderId: 2,
        senderName: 'Dr. Sarah Williams',
        content: 'Also, I\'ve attached some additional resources on managing anxiety in social situations that we can review together.',
        timestamp: new Date('2025-03-17T09:42:00'),
        isRead: false,
        isOwnMessage: false
      }
    ];
  }

  selectContact(contact: ChatContact) {
    this.selectedContact = contact;
    // Reset unread count
    contact.unreadCount = 0;
    // Load messages for this contact
    this.loadMessages(contact.id);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    
    const newMsg: Message = {
      id: this.messages.length + 1,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      content: this.newMessage,
      timestamp: new Date(),
      isRead: true,
      isOwnMessage: true
    };
    
    this.messages.push(newMsg);
    this.newMessage = '';
    // Scroll to bottom of message container (would be implemented in a real app)
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // This would be implemented to handle emoji selection
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
}