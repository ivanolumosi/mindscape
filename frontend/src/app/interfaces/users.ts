// src/app/interfaces/users.ts
export interface User {
  id?: number;
  userId?: number;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'counselor';
  profileImage?: string;
  specialization?: string;
  availabilitySchedule?: string;
  faculty?: string;
  privileges?: string;
  nickname?: string;
  isProfileComplete?: boolean;
  status?: 'online' | 'away' | 'busy' | 'offline';
  journalCount?: number;
  lastActivity?: string;
}
  export interface ChatUser {
status: string|string[]|Set<string>|{ [klass: string]: any; }|null|undefined;
    id: number;
    faculty?: string; 
    name: string;
    profile_image?: string;
    role: string;
    nickname?: string;
    last_message_id?: number;
    last_message_content?: string;
    last_message_type?: string;
    last_message_sender_id?: number;
    last_message_time?: Date;
    has_unread: boolean;
    unread_count: number;
    is_friend: boolean;
    is_counselor: boolean;
}