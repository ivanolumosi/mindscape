export interface Friend {
    id: any;
    is_counselor: any;
    profile_image: any;
    nickname: any;
    userId: number;
    friendId: number;
    name: string;
    email: string;
    profileImage?: string;
  }
  export interface FriendRequest {
    requestId: number;
    senderId: number;
    receiverId: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
  }
  