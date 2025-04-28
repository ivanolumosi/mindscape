export interface Friend {
    id: number;
    userId: number;
    friendId: number;
    username: string; // Assuming this comes from the Friend interface in backend
    email: string;
    profileImage?: string;
    faculty?: string;
    role?: string;
    createdAt: Date;
  }
  
  export interface FriendRequest {
    id: number;
    senderId: number;
    receiverId: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    // Additional properties that might be joined from user table
    senderName?: string;
    senderEmail?: string;
    senderProfileImage?: string;
  }
  export interface Goal {
    title: any;
    user_name: any;
    target_date: string|Date;
    description: any;
      id?: number;
      user_id?: number;
      goal_title: string;
      goal_description: string | null;
      goal_type: 'Daily' | 'Weekly' | 'Monthly';
      due_date: string | null;
      progress_percentage: number;
      is_completed: boolean;
      created_at?: string;
      updated_at?: string;
      category?: string; // Added category property
    }
    export interface DailyJournal {
        id?: number;
        user_id: number;
        title?: string; // Add the title property
        content: string;
        entry_date: string | null;
        mood: string;
        reflections: string;
        gratitude: string;
        created_at?: string | null;
        updated_at?: string | null;
        mood_tag?: string;
        user_name?: string;
      }  export interface MoodTracker {
        mood_type: any;
        id?: number;
        user_id: number;
        mood: string;
        notes?: string;
        recorded_at: Date;
        
      }
      
      export interface MoodStatistic {
      count: any;
        mood: string;
        mood_count: number;
      }
      
export interface Resource {
    id: number;
    title: string;
    description?: string;
    type: string;
    url?: string;
    author?: string;
    date_published?: Date;
    duration?: number;
    event_date?: Date;
    created_at: Date;
    updated_at: Date;
  }