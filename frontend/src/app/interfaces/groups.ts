export interface Group {
    group_id: number;
    name: string;
    description: string;
    created_by: number;
    created_at: Date;
  }
  
  export interface GroupMessage {
    id: number;
    group_id: number;
    sender_id: number;
    content: string;
    content_type: string;
    media_url?: string;
    sent_at: Date;
    sender_name: string;
  }
  
  export interface GroupMember {
    user_id: number;
    name: string;
    nickname?: string;
    profile_image?: string;
    is_admin: boolean;
  }
  