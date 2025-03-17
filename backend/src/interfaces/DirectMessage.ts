export interface DirectMessage {
    id: number;                     // Unique identifier for each message
    sender_id: number;              // The user who sent the message
    receiver_id: number;            // The user who received the message
    content: string;                // The content of the message
    parent_message_id?: number;    // ID of the parent message (if the message is a reply)
    is_read: boolean;               // Whether the message has been read (0 = unread, 1 = read)
    created_at: Date;               // Timestamp when the message was sent
    updated_at: Date;               // Timestamp when the message was last updated
  }
  