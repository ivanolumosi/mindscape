export interface FriendRequest {
    id: number;            // Unique identifier for the request
    sender_id: number;     // The user sending the friend request
    receiver_id: number;   // The user receiving the friend request
    status: string;        // Request status ('Pending', 'Accepted', 'Rejected')
    created_at: Date;      // Timestamp when the request was sent
  }
  