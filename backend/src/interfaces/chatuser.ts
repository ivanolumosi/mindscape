export interface ChatUser {
    id: number;
    name: string;
    profile_image?: string;
    role: string;
    nickname?: string;
    last_message_id?: number;
    last_message_content?: string;
    last_message_type?: string;
    last_message_sender_id?: number;
    last_message_time?: Date;
    has_unread: boolean;
    unread_count: number;
    is_friend: boolean;
    is_counselor: boolean;
}