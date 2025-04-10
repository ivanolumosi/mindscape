import { Comment } from './comment';

// interfaces/post.ts
export interface Post {
  id: number;
  userId?: number;
  user_id?: number;  // API version
  userName?: string;
  UserName?: string;  // API version
  content: string;
  createdAt?: Date | string;
  created_at?: string;  // API version
  updatedAt?: Date | string;
  updated_at?: string;  // API version
  userImage?: string;
}