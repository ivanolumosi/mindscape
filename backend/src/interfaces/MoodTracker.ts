export interface MoodTracker {
    id: number;                               // Unique identifier for each mood entry
    user_id: number;                          // ID of the user who is recording the mood
    mood: string;                             // The mood value (e.g., "happy", "sad", "anxious")
    notes?: string;                           // Optional additional notes or thoughts
    recorded_at: Date;                       // Timestamp for when the mood was recorded
    mood_type:string;
  }
  