export interface Comment {
    id: number;                           // Unique identifier for each comment
    post_id: number;                      // The post the comment belongs to (references Posts table)
    user_id: number;                      // The user who commented (references Users table)
    content: string;                      // The content of the comment
    created_at: Date;                     // Timestamp when the comment was created
    updated_at: Date;                     // Timestamp when the comment was last updated
  }
  