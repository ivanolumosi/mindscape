// src/interfaces/Group.ts
export interface Group {
    id: number;
    name: string;
    description?: string;
    created_by: number;
    created_at: Date;
    
    // Additional fields returned by sp_GetUserGroups
    created_by_name?: string;
    created_by_image?: string;
    is_admin?: boolean;
    member_count?: number;
    unread_count?: number;
    last_message?: string;
    last_activity?: Date;
}

// src/interfaces/GroupMember.ts
export interface GroupMember {
    id: number;
    group_id: number;
    user_id: number;
    joined_at: Date;
    is_admin: boolean;
    
    // Additional fields returned by sp_GetGroupMembers
    name?: string;
    email?: string;
    role?: string;
    profile_image?: string;
    nickname?: string;
    is_current_user?: boolean;
    is_friend?: boolean;
    is_counselor?: boolean;
}

// src/interfaces/GroupMessage.ts
export interface GroupMessage {
    id: number;
    group_id: number;
    sender_id: number;
    content: string;
    content_type: string;
    media_url?: string;
    is_read: boolean;
    is_edited: boolean;
    created_at: Date;
    updated_at: Date;
    
    // Additional fields returned by sp_GetGroupMessages
    sender_name?: string;
    sender_image?: string;
    is_sender_counselor?: boolean;
    is_unread?: boolean;
    is_sender_admin?: boolean;
}
