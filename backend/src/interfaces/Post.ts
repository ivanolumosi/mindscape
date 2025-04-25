export interface Post {
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
}