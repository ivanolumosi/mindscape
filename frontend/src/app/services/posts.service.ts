import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Post } from '../interfaces/PostModel';
import { Comment } from '../interfaces/post';
import { AuthService } from './auth.service';
import { tap, catchError, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = 'http://localhost:3000/api';

  private feedSubject = new BehaviorSubject<Post[]>([]);
  public feed$: Observable<Post[]> = this.feedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /** 🔁 Fetch feed using current user */
  refreshFeed(page: number = 1, pageSize: number = 10, includeCounselors = true): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('includeCounselors', includeCounselors.toString());

    this.http.get<Post[]>(`${this.apiUrl}/feed/${userId}`, { params })
      .subscribe({
        next: feed => this.feedSubject.next(feed),
        error: error => console.error('Error fetching feed:', error)
      });
  }

  /** 📤 Upload media file and get URL */
  uploadMedia(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{url: string}>(`${this.apiUrl}/upload`, formData)
      .pipe(
        map(response => response.url),
        catchError(error => {
          console.error('Error uploading media:', error);
          throw error;
        })
      );
  }

  /** 📥 Create post with proper media handling */
  createPost(content: string, contentType: string = 'text', file?: File | null): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    // If we have a file, upload it first then create the post
    if (file && contentType === 'image') {
      return this.uploadMedia(file).pipe(
        switchMap(mediaUrl => {
          const postData = { userId, content, contentType, mediaUrl };
          return this.createPostRequest(postData);
        })
      );
    } else {
      // No file, just create the post with text content
      const postData = { userId, content, contentType, mediaUrl: null };
      return this.createPostRequest(postData);
    }
  }

  /** 🔄 Helper method to create post after media upload if needed */
  private createPostRequest(postData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/post`, postData).pipe(
      tap(response => {
        const newPost: Post = {
          id: response.post_id,
          content: postData.content,
          content_type: postData.contentType,
          media_url: postData.mediaUrl,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: postData.userId,
          user_name: this.authService.getCurrentUser()?.name || 'You',
          profile_image: this.authService.getCurrentUser()?.profileImage || null,
          nickname: this.authService.getCurrentUser()?.nickname || null,
          comment_count: 0,
          is_counselor: this.authService.isCounselor(),
          showOptions: false,
          showComments: false,
          comments: [],
          loadingComments: false,
          newComment: '',
          commentFile: null,
          commentPreview: null,
          liked: false,
          saved: false,
          likes: 0,
          formatCreationTime: function(): string {
            const date = new Date(this.created_at);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            
            return date.toLocaleDateString();
          },
          hasMedia: function(): boolean {
            return !!this.media_url && this.content_type === 'image';
          },
          hasText: function(): boolean {
            return !!this.content && this.content.trim().length > 0;
          },
          getExcerpt: function(maxLength = 100): string {
            if (!this.content) return '';
            if (this.content.length <= maxLength) return this.content;
            return this.content.substring(0, maxLength) + '...';
          }
        };

        const currentFeed = this.feedSubject.getValue();
        this.feedSubject.next([newPost, ...currentFeed]);
      }),
      catchError(error => {
        console.error('Error creating post:', error);
        throw error;
      })
    );
  }

  /** ❌ Delete post and remove from feed */
  deletePost(postId: number): Observable<{ Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    return this.http.request<{ Result: string }>('delete', `${this.apiUrl}/post`, {
      body: { postId, userId }
    }).pipe(
      tap(() => {
        const updatedFeed = this.feedSubject.getValue().filter(p => p.id !== postId);
        this.feedSubject.next(updatedFeed);
      }),
      catchError(error => {
        console.error('Error deleting post:', error);
        throw error;
      })
    );
  }

  /** 💬 Add comment to a post with proper media handling */
  addComment(commentData: {
    postId: number;
    content: string;
    contentType?: string;
    file?: File | null;
  }): Observable<{ comment_id: number; Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    // Handle file upload for comments if present
    if (commentData.file && commentData.contentType === 'image') {
      return this.uploadMedia(commentData.file).pipe(
        switchMap(mediaUrl => {
          const payload = {
            postId: commentData.postId,
            content: commentData.content,
            contentType: commentData.contentType,
            mediaUrl: mediaUrl,
            userId
          };
          return this.http.post<{ comment_id: number; Result: string }>(`${this.apiUrl}/comment`, payload);
        })
      );
    } else {
      // No file, just add the comment
      const payload = {
        postId: commentData.postId,
        content: commentData.content,
        contentType: commentData.contentType || 'text',
        mediaUrl: null,
        userId
      };
      return this.http.post<{ comment_id: number; Result: string }>(`${this.apiUrl}/comment`, payload);
    }
  }

  /** ✏️ Update a comment */
  updateComment(commentData: {
    commentId: number;
    content: string;
    contentType?: string;
    file?: File | null;
  }): Observable<{ Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    // Handle file upload for comment updates if present
    if (commentData.file && commentData.contentType === 'image') {
      return this.uploadMedia(commentData.file).pipe(
        switchMap(mediaUrl => {
          const payload = {
            commentId: commentData.commentId,
            content: commentData.content,
            contentType: commentData.contentType,
            mediaUrl: mediaUrl,
            userId
          };
          return this.http.put<{ Result: string }>(`${this.apiUrl}/comment`, payload);
        })
      );
    } else {
      // No file, just update the comment
      const payload = {
        commentId: commentData.commentId,
        content: commentData.content,
        contentType: commentData.contentType || 'text',
        mediaUrl: null,
        userId
      };
      return this.http.put<{ Result: string }>(`${this.apiUrl}/comment`, payload);
    }
  }

  /** ❌ Delete comment */
  deleteComment(commentId: number): Observable<{ Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    return this.http.request<{ Result: string }>('delete', `${this.apiUrl}/comment`, {
      body: { commentId, userId }
    }).pipe(
      catchError(error => {
        console.error('Error deleting comment:', error);
        throw error;
      })
    );
  }

  /** 🔍 Get a single post and its comments */
  getPostWithComments(postId: number): Observable<{ post: Post; comments: Comment[] }> {
    return this.http.get<{ post: Post; comments: Comment[] }>(`${this.apiUrl}/post/${postId}`).pipe(
      catchError(error => {
        console.error('Error fetching post with comments:', error);
        throw error;
      })
    );
  }

  /** 🧩 Get timeline posts (for a specific user's profile) */
  getUserTimeline(userId: number, page: number = 1, pageSize: number = 10): Observable<Post[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<Post[]>(`${this.apiUrl}/timeline/${userId}`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching user timeline:', error);
        throw error;
      })
    );
  }

  /** 👍 Like a post */
  likePost(postId: number): Observable<{ Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    return this.http.post<{ Result: string }>(`${this.apiUrl}/like`, { postId, userId }).pipe(
      tap(() => {
        // Update the post in our local feed
        const currentFeed = this.feedSubject.getValue();
        const updatedFeed = currentFeed.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              liked: true,
              likes: post.likes + 1
            } as Post; // Cast to Post to ensure TypeScript recognizes it correctly
          }
          return post;
        });
        this.feedSubject.next(updatedFeed);
      }),
      catchError(error => {
        console.error('Error liking post:', error);
        throw error;
      })
    );
  }

  /** 👎 Unlike a post */
  unlikePost(postId: number): Observable<{ Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    return this.http.delete<{ Result: string }>(`${this.apiUrl}/like`, {
      body: { postId, userId }
    }).pipe(
      tap(() => {
        // Update the post in our local feed
        const currentFeed = this.feedSubject.getValue();
        const updatedFeed = currentFeed.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              liked: false,
              likes: Math.max(0, post.likes - 1)
            } as Post; // Cast to Post
          }
          return post;
        });
        this.feedSubject.next(updatedFeed);
      }),
      catchError(error => {
        console.error('Error unliking post:', error);
        throw error;
      })
    );
  }

  /** 🔖 Save a post */
  savePost(postId: number): Observable<{ Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    return this.http.post<{ Result: string }>(`${this.apiUrl}/save`, { postId, userId }).pipe(
      tap(() => {
        // Update the post in our local feed
        const currentFeed = this.feedSubject.getValue();
        const updatedFeed = currentFeed.map(post => {
          if (post.id === postId) {
            return { ...post, saved: true } as Post; // Cast to Post
          }
          return post;
        });
        this.feedSubject.next(updatedFeed);
      }),
      catchError(error => {
        console.error('Error saving post:', error);
        throw error;
      })
    );
  }

  /** 🗑️ Unsave a post */
  unsavePost(postId: number): Observable<{ Result: string }> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    return this.http.delete<{ Result: string }>(`${this.apiUrl}/save`, {
      body: { postId, userId }
    }).pipe(
      tap(() => {
        // Update the post in our local feed
        const currentFeed = this.feedSubject.getValue();
        const updatedFeed = currentFeed.map(post => {
          if (post.id === postId) {
            return { ...post, saved: false } as Post; // Cast to Post
          }
          return post;
        });
        this.feedSubject.next(updatedFeed);
      }),
      catchError(error => {
        console.error('Error unsaving post:', error);
        throw error;
      })
    );
  }

  /** 📋 Get saved posts */
  getSavedPosts(page: number = 1, pageSize: number = 10): Observable<Post[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<Post[]>(`${this.apiUrl}/saved/${userId}`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching saved posts:', error);
        throw error;
      })
    );
  }
}