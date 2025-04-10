export interface Goal {
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
    category?: string; // Add this property
  }