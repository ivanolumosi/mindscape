
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

  export interface CounsellorDashboardData {
    totalUsers: number;
    totalJournalEntries: number;
    totalMoodEntries: number;
    totalGoals: number;
    recentUsers: any[]; // You might want to define a proper User type here
    moodDistribution: any[]; // Consider defining a proper type for mood distribution
  }
  