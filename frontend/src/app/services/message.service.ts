import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService, User } from './auth.service';
import { DirectMessage } from '../interfaces/Direct_messages';
import { Group, GroupMessage, GroupMember } from '../interfaces/groups';
import { ChatUser } from '../interfaces/users';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // 🧠 Direct Messages State
  private chatListSubject = new BehaviorSubject<ChatUser[]>([]);
  chatList$ = this.chatListSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<{ total: number; conversations: number }>({ total: 0, conversations: 0 });
  unreadCount$ = this.unreadCountSubject.asObservable();

  private messagesSubject = new BehaviorSubject<DirectMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  // =============================================
  // Direct Messaging
  // =============================================

  sendDirectMessage(receiverId: number, content: string, contentType: string = 'text', mediaUrl?: string): Observable<any> {
    const senderId = this.authService.getCurrentUserId();
    if (!senderId) throw new Error('User not logged in');

    const body = { senderId, receiverId, content, contentType, mediaUrl };

    return this.http.post(`${this.apiUrl}/direct-message`, body).pipe(
      tap(() => this.loadChatList())
    );
  }

  editDirectMessage(messageId: number, content: string, contentType?: string, mediaUrl?: string): Observable<any> {
    const senderId = this.authService.getCurrentUserId();
    const body = { messageId, senderId, content, contentType, mediaUrl };
    return this.http.put(`${this.apiUrl}/direct-message`, body);
  }

  markMessageAsRead(messageId: number): Observable<any> {
    const receiverId = this.authService.getCurrentUserId();
    return this.http.put(`${this.apiUrl}/direct-message/read`, { messageId, receiverId }).pipe(
      tap(() => this.getUnreadMessageCount()) // Update unread counter
    );
  }

  getChatHistory(partnerId: number, limit: number = 50, beforeMessageId?: number): void {
    const userId = this.authService.getCurrentUserId();
    const url = `${this.apiUrl}/chat-history/${userId}/${partnerId}`;

    this.http.get<DirectMessage[]>(url).subscribe(messages => {
      this.messagesSubject.next(messages);
    });
  }

  loadChatList(): void {
    const userId = this.authService.getCurrentUserId();
    this.http.get<ChatUser[]>(`${this.apiUrl}/chat-list/${userId}`).subscribe(chatList => {
      this.chatListSubject.next(chatList);
    });
  }

  getUnreadMessageCount(): void {
    const userId = this.authService.getCurrentUserId();
    this.http.get<{ total_unread: number; unread_conversations: number }>(`${this.apiUrl}/unread-count/${userId}`)
      .subscribe(count => {
        this.unreadCountSubject.next({
          total: count.total_unread,
          conversations: count.unread_conversations
        });
      });
  }

  // =============================================
  // Group Messaging
  // =============================================

  createGroup(name: string, description: string, initialMembers?: string): Observable<any> {
    const createdBy = this.authService.getCurrentUserId();
    const body = { name, description, createdBy, initialMembers };
    return this.http.post(`${this.apiUrl}/group`, body);
  }

  deleteGroup(groupId: number): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    return this.http.request('delete', `${this.apiUrl}/group`, {
      body: { groupId, userId }
    });
  }

  joinGroup(groupId: number): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/group/join`, { groupId, userId });
  }

  leaveGroup(groupId: number): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/group/leave`, { groupId, userId });
  }

  changeGroupAdmin(groupId: number, userId: number, makeAdmin: boolean): Observable<any> {
    const adminId = this.authService.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/group/admin`, {
      groupId, adminId, userId, makeAdmin
    });
  }

  sendGroupMessage(groupId: number, content: string, contentType: string = 'text', mediaUrl?: string): Observable<any> {
    const senderId = this.authService.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/group/message`, {
      groupId, senderId, content, contentType, mediaUrl
    });
  }

  getGroupMessages(groupId: number): Observable<GroupMessage[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<GroupMessage[]>(`${this.apiUrl}/group/messages/${groupId}/${userId}`);
  }

  getUserGroups(): Observable<Group[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Group[]>(`${this.apiUrl}/groups/${userId}`);
  }

  getGroupMembers(groupId: number): Observable<GroupMember[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<GroupMember[]>(`${this.apiUrl}/group/members/${groupId}/${userId}`);
  }

  sendGroupInvite(groupId: number, receiverId: number): Observable<any> {
    const senderId = this.authService.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/group/invite`, { groupId, senderId, receiverId });
  }
  findSimilarUsers(limit: number = 5): Observable<User[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');
  
    return this.http.get<User[]>(`${this.apiUrl}/analytics/similar/${userId}`, {
      params: { limit: limit.toString() }
    });
  }
}
