export interface Goal {
    id: number;                                // Unique identifier for each goal
    user_id: number;                           // ID of the user who set the goal
    goal_title: string;                        // Title of the goal
    goal_description?: string;                 // Detailed description of the goal
    goal_type: 'Daily' | 'Weekly' | 'Monthly'; // Type of goal: 'Daily', 'Weekly', 'Monthly'
    is_completed: boolean;                     // Whether the goal is completed (true = Yes, false = No)
    progress_percentage: number;               // Progress tracking (0 to 100%)
    due_date?: Date;                           // Target completion date (optional)
    created_at: Date;                          // Timestamp when the goal was created
    updated_at: Date;                          // Last updated timestamp
  }
  