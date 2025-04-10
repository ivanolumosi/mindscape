export interface Comment {
    id: number;
    postId: number;
    userId: number;
    user_id?: number;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
    userName?: string;
    userAvatar?: string;
  }