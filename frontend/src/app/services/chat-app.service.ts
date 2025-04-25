import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../interfaces/PostModel';
import { Comment } from '../interfaces/comment';
import { DirectMessage } from '../interfaces/Direct_messages';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatAppService {
  private apiUrl = 'http://localhost:3000/api/chat';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Posts methods
  createPost(content: string): Observable<Post> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    
    return this.http.post<Post>(`${this.apiUrl}/posts`, {
      userId,
      content
    });
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }

  updatePost(postId: number, content: string): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts`, {
      postId,
      content
    });
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}`);
  }

  // Comments methods
  addComment(postId: number, content: string): Observable<Comment> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    
    return this.http.post<Comment>(`${this.apiUrl}/comments`, {
      postId,
      userId,
      content
    });
  }

  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/${postId}`);
  }

  updateComment(commentId: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments`, {
      commentId,
      content
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }

  // Messages methods
  sendDirectMessage(receiverId: number, content: string): Observable<DirectMessage> {
    const senderId = this.authService.getCurrentUserId();
    if (!senderId) {
      throw new Error('User not logged in');
    }
    
    return this.http.post<DirectMessage>(`${this.apiUrl}/messages`, {
      senderId,
      receiverId,
      content
    });
  }

  replyToMessage(receiverId: number, content: string, parentMessageId: number): Observable<DirectMessage> {
    const senderId = this.authService.getCurrentUserId();
    if (!senderId) {
      throw new Error('User not logged in');
    }
    
    return this.http.post<DirectMessage>(`${this.apiUrl}/messages/reply`, {
      senderId,
      receiverId,
      content,
      parentMessageId
    });
  }

  getConversation(otherUserId: number): Observable<DirectMessage[]> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    
    return this.http.get<DirectMessage[]>(`${this.apiUrl}/messages/${currentUserId}/${otherUserId}`);
  }

  getUnreadMessages(): Observable<DirectMessage[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    
    return this.http.get<DirectMessage[]>(`${this.apiUrl}/messages/unread/${userId}`);
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/messages/read/${messageId}`, {});
  }

  deleteConversation(otherUserId: number): Observable<void> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not logged in');
    }
    
    return this.http.delete<void>(`${this.apiUrl}/messages/${currentUserId}/${otherUserId}`);
  }

  deleteOldMessages(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/old`);
  }
  createOrOpenChat(friendId: number): void {
    console.log(`Opening chat with friendId: ${friendId}`);
    // TODO: Implement navigation or logic to open chat
  }

}