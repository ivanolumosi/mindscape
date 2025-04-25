import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { PostsService } from '../services/posts.service';
import { AuthService } from '../services/auth.service';
import { Comment } from '../interfaces/post';
import { Post } from '../interfaces/PostModel';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('commentFileInput') commentFileInput!: ElementRef;
  
  // Form controls
  postForm: FormGroup;
  isSubmitting = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  sidebarVisible = false;
  
  // Posts data
  posts: Post[] = [];
  loadingPosts = false;
  noMorePosts = false;
  currentPage = 1;
  pageSize = 10;
  includeCounselors = true;
  
  // Subscriptions
  private feedSubscription: Subscription | null = null;
  
  constructor(
    private fb: FormBuilder,
    public postsService: PostsService,
    public authService: AuthService,
    private toastService: ToastService
  ) {
    this.postForm = this.fb.group({
      content: ['', [Validators.maxLength(500)]],
    });
  }

  // Format comment times
  formatCommentTime(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  }

  ngOnInit(): void {
    this.loadPosts();
    
    // Subscribe to feed updates
    this.feedSubscription = this.postsService.feed$.subscribe(posts => {
      this.posts = posts.map(post => new Post(post));
      this.loadingPosts = false;
      
      // Check if we've reached the end
      if (posts.length < this.pageSize) {
        this.noMorePosts = true;
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.feedSubscription) {
      this.feedSubscription.unsubscribe();
    }
  }
  
  loadPosts(): void {
    this.loadingPosts = true;
    // Reset noMorePosts when loading first page
    if (this.currentPage === 1) {
      this.noMorePosts = false;
    }
    this.postsService.refreshFeed(this.currentPage, this.pageSize, this.includeCounselors);
  }
  
  loadMorePosts(): void {
    if (this.loadingPosts || this.noMorePosts) return;
    
    this.loadingPosts = true;
    this.currentPage++;
    this.postsService.refreshFeed(this.currentPage, this.pageSize, this.includeCounselors);
  }
  
  toggleCounselorPosts(): void {
    this.includeCounselors = !this.includeCounselors;
    this.currentPage = 1;
    this.loadPosts();
  }
  
  // File handling for post creation
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create preview for selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  // Post submission - fixed to use the file directly instead of base64 string
  onSubmit(): void {
    if (this.isSubmitting) return;
    
    const content = this.postForm.get('content')?.value || '';
    if (!content && !this.selectedFile) return;
    
    this.isSubmitting = true;
    const contentType = this.selectedFile ? 'image' : 'text';
    
    this.postsService.createPost(content, contentType, this.selectedFile).subscribe({
      next: () => {
        this.toastService.show('Post created successfully!', 'success');
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating post:', error);
        this.toastService.show('Failed to create post. Please try again.', 'error');
        this.isSubmitting = false;
      }
    });
  }
  
  resetForm(): void {
    this.postForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.isSubmitting = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  // Post interactions
  togglePostOptions(post: Post): void {
    post.showOptions = !post.showOptions;
  }
  
  deletePost(post: Post): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postsService.deletePost(post.id).subscribe({
        next: () => {
          this.toastService.show('Post deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          this.toastService.show('Failed to delete post. Please try again.', 'error');
        }
      });
    }
  }
  
  // Like/unlike post
  toggleLike(post: Post): void {
    if (post.liked) {
      this.postsService.unlikePost(post.id).subscribe({
        next: () => {
          post.liked = false;
          post.likes = Math.max(0, post.likes - 1);
        },
        error: (error) => {
          console.error('Error unliking post:', error);
          this.toastService.show('Failed to unlike post. Please try again.', 'error');
        }
      });
    } else {
      this.postsService.likePost(post.id).subscribe({
        next: () => {
          post.liked = true;
          post.likes++;
        },
        error: (error) => {
          console.error('Error liking post:', error);
          this.toastService.show('Failed to like post. Please try again.', 'error');
        }
      });
    }
  }
  
  // Save/unsave post
  toggleSave(post: Post): void {
    if (post.saved) {
      this.postsService.unsavePost(post.id).subscribe({
        next: () => {
          post.saved = false;
          this.toastService.show('Post removed from saved items', 'info');
        },
        error: (error) => {
          console.error('Error unsaving post:', error);
          this.toastService.show('Failed to unsave post. Please try again.', 'error');
        }
      });
    } else {
      this.postsService.savePost(post.id).subscribe({
        next: () => {
          post.saved = true;
          this.toastService.show('Post saved successfully!', 'success');
        },
        error: (error) => {
          console.error('Error saving post:', error);
          this.toastService.show('Failed to save post. Please try again.', 'error');
        }
      });
    }
  }
  
  // Comments section
  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
    
    if (post.showComments && post.comments.length === 0) {
      this.loadComments(post);
    }
  }
  
  loadComments(post: Post): void {
    post.loadingComments = true;
    
    this.postsService.getPostWithComments(post.id).subscribe({
      next: (response) => {
        post.comments = response.comments;
        post.comment_count = post.comments.length;
        post.loadingComments = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        post.loadingComments = false;
        this.toastService.show('Failed to load comments. Please try again.', 'error');
      }
    });
  }
  
  // Comment file handling
  onCommentFileSelected(event: Event, post: Post): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      post.commentFile = input.files[0];
      
      // Create preview for comment image
      const reader = new FileReader();
      reader.onload = () => {
        post.commentPreview = reader.result as string;
      };
      reader.readAsDataURL(post.commentFile);
    }
  }
  
  removeCommentImage(post: Post): void {
    post.commentFile = null;
    post.commentPreview = null;
    if (this.commentFileInput) {
      this.commentFileInput.nativeElement.value = '';
    }
  }
  
  // Add comment - updated to use the file directly
  addComment(post: Post): void {
    if (!post.newComment.trim() && !post.commentFile) return;
    
    const contentType = post.commentFile ? 'image' : 'text';
    
    this.postsService.addComment({
      postId: post.id,
      content: post.newComment,
      contentType,
      file: post.commentFile
    }).subscribe({
      next: () => {
        // Reload comments to include the new one
        this.loadComments(post);
        
        // Reset comment form
        post.newComment = '';
        post.commentFile = null;
        post.commentPreview = null;
        if (this.commentFileInput) {
          this.commentFileInput.nativeElement.value = '';
        }
        
        this.toastService.show('Comment added successfully!', 'success');
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.toastService.show('Failed to add comment. Please try again.', 'error');
      }
    });
  }
  
  // Delete comment
  deleteComment(post: Post, commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.postsService.deleteComment(commentId).subscribe({
        next: () => {
          post.comments = post.comments.filter(c => c.id !== commentId);
          post.comment_count = Math.max(0, post.comment_count - 1);
          this.toastService.show('Comment deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
          this.toastService.show('Failed to delete comment. Please try again.', 'error');
        }
      });
    }
  }
}