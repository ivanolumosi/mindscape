import { Comment } from '../interfaces/post';

export class Post {
  id: number;
  content: string;
  content_type: string;
  media_url: string | null;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  user_name: string;
  profile_image: string | null;
  nickname: string | null;
  comment_count: number;
  is_counselor: boolean;
  is_friend?: boolean;
  
  // UI state properties
  showOptions: boolean = false;
  showComments: boolean = false;
  comments: Comment[] = [];
  loadingComments: boolean = false;
  newComment: string = '';
  commentFile: File | null = null;
  commentPreview: string | null = null;
  liked: boolean = false;
  saved: boolean = false;
  likes: number = 0;
  
  constructor(post: any) {
    this.id = post.id;
    this.content = post.content;
    this.content_type = post.content_type;
    this.media_url = post.media_url;
    this.created_at = new Date(post.created_at);
    this.updated_at = new Date(post.updated_at);
    this.user_id = post.user_id;
    this.user_name = post.user_name;
    this.profile_image = post.profile_image;
    this.nickname = post.nickname;
    this.comment_count = post.comment_count;
    this.is_counselor = post.is_counselor;
    this.is_friend = post.is_friend;
    this.likes = post.likes || 0;
  }
  
  /**
   * Format the creation date for display
   */
  formatCreationTime(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.created_at.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return this.created_at.toLocaleDateString();
    }
  }
  
  /**
   * Check if the post has media content
   */
  hasMedia(): boolean {
    return !!this.media_url && this.content_type.includes('image');
  }
  
  /**
   * Check if the post has text content
   */
  hasText(): boolean {
    return !!this.content && this.content.trim().length > 0;
  }
  
  /**
   * Get excerpt of the content (for previews)
   */
  getExcerpt(maxLength: number = 100): string {
    if (!this.content) return '';
    
    if (this.content.length <= maxLength) {
      return this.content;
    }
    
    return this.content.substring(0, maxLength) + '...';
  }
}