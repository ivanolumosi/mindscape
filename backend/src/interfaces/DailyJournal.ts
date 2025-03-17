export interface DailyJournal {
    id: number;                       // Unique identifier for each journal entry
    user_id: number;                  // ID of the user (student) who created the journal entry
    entry_date: Date;                 // The date of the journal entry
    mood?: string;                    // The mood of the user (e.g., 'Happy', 'Sad', 'Anxious')
    reflections?: string;             // A detailed reflection or description of the user's day
    gratitude?: string;               // What the user is grateful for on that day
    created_at: Date;                 // Timestamp when the entry is created
    updated_at: Date;                 // Timestamp when the entry is last updated
  }
  