export interface Friend {
  friendship_id: number;
  friend_id: number;
  friend_name: string;
  email: string;
  role: 'seeker' | 'counselor' | 'admin';
  profile_image?: string | null;
  nickname?: string | null;
  specialization?: string | null;
  created_at: Date;
  is_counselor: boolean;
}
