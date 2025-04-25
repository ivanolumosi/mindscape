// interfaces/Session.ts
export interface Session {
    id: number;
    session_title: string;
    venue: string;
    session_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    max_participants: number;
    description?: string;
}

// interfaces/Message.ts
export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    parent_message_id?: number;
    is_read: boolean;
    created_at: string;
}

// interfaces/Availability.ts
export interface Availability {
    id: number;
    available_day: string;
    start_time: string;
    end_time: string;
}
