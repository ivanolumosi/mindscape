export interface DirectMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  content_type: string;
  media_url?: string;
  parent_message_id?: number;
  is_read: boolean;
  is_edited: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Fields returned by sp_GetChatHistory
  sender_name?: string;
  sender_image?: string;
  receiver_name?: string;
  receiver_image?: string;
  is_sender_counselor?: boolean;
}