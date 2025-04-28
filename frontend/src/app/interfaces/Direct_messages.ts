export interface DirectMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  contentType: string;
  mediaUrl?: string;
  createdAt: Date;
  isRead: boolean;
  parentMessageId?: number;
  
}
