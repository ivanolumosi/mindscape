export interface CrisisChat {
    id: number;                          // Unique identifier for each message
    crisis_id: number;                    // ID of the associated crisis
    sender_id: number;                    // ID of the user sending the message (seeker or counselor)
    message: string;                      // The content of the message
    timestamp: Date;                      // Timestamp of when the message was sent
  }
  