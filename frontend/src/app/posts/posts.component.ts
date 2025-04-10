import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatAppService } from '../services/chat-app.service';
import { AuthService } from '../services/auth.service';
import { Post } from '../interfaces/post';
import { Comment } from '../interfaces/comment';

interface PostWithComments extends Post {
  comments: Comment[];
  showComments: boolean;
  newComment: string;
  isLoading: boolean;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,SidebarComponent],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent  implements OnInit {
    posts: PostWithComments[] = [];
    newPost: string = '';
    isLoading: boolean = false;
    isSubmitting: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    currentUserId: number | null | undefined  = null;
  
    constructor(
      private chatService: ChatAppService,
      private authService: AuthService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.currentUserId = this.authService.getCurrentUserId();
      this.loadPosts();
    }
  
    loadPosts(): void {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.chatService.getAllPosts().subscribe(
        (posts) => {
          // Map API fields to our expected fields
          this.posts = posts.map(post => ({
            ...post,
            userId: post.user_id || post.userId, 
            userName: post.UserName || post.userName || 'Anonymous',
            createdAt: post.created_at || post.createdAt,
            updatedAt: post.updated_at || post.updatedAt,
            comments: [],
            showComments: false,
            newComment: '',
            isLoading: false
          }));
          this.isLoading = false;
          console.log('Processed posts:', this.posts);
        },
        (error) => {
          console.error('Error loading posts:', error);
          this.errorMessage = 'Failed to load posts. Please try again.';
          this.isLoading = false;
        }
      );
    }
  
    createPost(): void {
      if (!this.newPost.trim()) return;
      
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      this.chatService.createPost(this.newPost).subscribe(
        (post) => {
          const newPost: PostWithComments = {
            ...post,
            comments: [],
            showComments: false,
            newComment: '',
            isLoading: false
          };
          
          this.posts.unshift(newPost);
          this.newPost = '';
          this.isSubmitting = false;
          this.successMessage = 'Post created successfully!';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        (error) => {
          console.error('Error creating post:', error);
          this.errorMessage = 'Failed to create post. Please try again.';
          this.isSubmitting = false;
        }
      );
    }
  
    toggleComments(post: PostWithComments): void {
      post.showComments = !post.showComments;
      
      if (post.showComments && post.comments.length === 0) {
        this.loadComments(post);
      }
    }
  
    loadComments(post: PostWithComments): void {
      post.isLoading = true;
      
      this.chatService.getCommentsByPost(post.id).subscribe(
        (comments) => {
          post.comments = comments;
          post.isLoading = false;
        },
        (error) => {
          console.error('Error loading comments:', error);
          post.isLoading = false;
        }
      );
    }
  
    addComment(post: PostWithComments): void {
      if (!post.newComment.trim()) return;
      
      this.chatService.addComment(post.id, post.newComment).subscribe(
        (comment) => {
          post.comments.push(comment);
          post.newComment = '';
        },
        (error) => {
          console.error('Error adding comment:', error);
        }
      );
    }
  
    deletePost(post: PostWithComments, event: Event): void {
      event.stopPropagation();
      
      if (confirm('Are you sure you want to delete this post?')) {
        this.chatService.deletePost(post.id).subscribe(
          () => {
            this.posts = this.posts.filter(p => p.id !== post.id);
            this.successMessage = 'Post deleted successfully!';
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          (error) => {
            console.error('Error deleting post:', error);
            this.errorMessage = 'Failed to delete post. Please try again.';
          }
        );
      }
    }
  
    deleteComment(post: PostWithComments, comment: Comment, event: Event): void {
      event.stopPropagation();
      
      if (confirm('Are you sure you want to delete this comment?')) {
        this.chatService.deleteComment(comment.id).subscribe(
          () => {
            post.comments = post.comments.filter(c => c.id !== comment.id);
          },
          (error) => {
            console.error('Error deleting comment:', error);
          }
        );
      }
    }
  
    viewUserProfile(userId: number | undefined, event: Event): void {
      event.stopPropagation();
      
     
      if (userId === undefined) {
        console.warn('Cannot view profile: User ID is undefined');
        return;
      }
      
      
      this.router.navigate(['/profile', userId]);
    }
  
   
    formatDate(dateInput: string | Date | null | undefined): string {
      if (!dateInput) return 'Unknown date';
      
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      // Less than a minute
      if (diffInSeconds < 60) {
        return 'Just now';
      }
      
      // Less than an hour
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      
      // Less than a day
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      }
      
      // Less than 2 days
      if (diffInSeconds < 172800) {
        return 'Yesterday';
      }
      
      // Less than 7 days
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} days ago`;
      }
      
      // Less than 30 days
      if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      }
      
      // Regular date format
      return date.toLocaleDateString();
    }
    // Returns a consistent color based on post ID for visual variety
    getPostBackgroundColor(postId: number): string {
      const colors = [
        'bg-emerald-50', 
        'bg-teal-50', 
        'bg-green-50', 
        'bg-lime-50',
        'bg-sky-50'
      ];
      return colors[postId % colors.length];
    }
  
    isOwnPost(post: Post): boolean {
      // Check if both userId and currentUserId exist before comparing
      return (post.userId !== undefined && this.currentUserId !== null && 
              post.userId === this.currentUserId) ||
             (post.user_id !== undefined && this.currentUserId !== null && 
              post.user_id === this.currentUserId);
    }
    
    isOwnComment(comment: Comment): boolean {
      // Check if both userId and currentUserId exist before comparing
      return comment.userId !== undefined && this.currentUserId !== null && 
             comment.userId === this.currentUserId;
    }
  }