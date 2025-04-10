export interface DirectMessage {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: Date;
    isRead: boolean;
    parentMessageId?: number;
    senderName?: string;
    senderAvatar?: string;
  }