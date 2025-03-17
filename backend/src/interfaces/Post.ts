export interface Post {
    id: number;                              // Unique identifier for each post
    user_id: number;                         // User who created the post (foreign key to Users)
    content: string;                         // Content of the post
    created_at: Date;                        // Timestamp when the post was created
    updated_at: Date;                        // Timestamp when the post was last updated
  }
