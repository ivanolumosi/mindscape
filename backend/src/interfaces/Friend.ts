export interface Friend {
    id: number;           // Unique identifier for the friendship
    user_id: number;      // The ID of the first user
    friend_id: number;    // The ID of the second user (friend)
    created_at: Date;     // Timestamp when the friendship was created
  }
  