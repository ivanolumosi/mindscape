import { Request, Response } from 'express';
import { MessageService } from '../services/messagesService';

const messageService = new MessageService();

// Helper
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'An unknown error occurred';
};

// ➡️ Send Direct Message
export const sendDirectMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { senderId, receiverId, content, contentType, mediaUrl, parentMessageId } = req.body;
        if (!senderId || !receiverId || !content) {
            res.status(400).json({ error: 'Sender ID, Receiver ID, and content are required' });
            return;
        }

        const message = await messageService.sendDirectMessage(senderId, receiverId, content, contentType, mediaUrl, parentMessageId);
        res.status(201).json({ message: 'Direct message sent successfully', data: message });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Edit Direct Message
export const editDirectMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { messageId, senderId, content, contentType, mediaUrl } = req.body;
        if (!messageId || !senderId || !content) {
            res.status(400).json({ error: 'Message ID, Sender ID, and content are required' });
            return;
        }

        const result = await messageService.editDirectMessage(messageId, senderId, content, contentType, mediaUrl);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Mark Message as Read
export const markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { messageId, receiverId } = req.body;
        if (!messageId || !receiverId) {
            res.status(400).json({ error: 'Message ID and Receiver ID are required' });
            return;
        }

        const result = await messageService.markMessageAsRead(messageId, receiverId);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get Chat History Between Two Users
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user1Id, user2Id } = req.params;
        const { limit = 50, beforeMessageId } = req.query;

        if (!user1Id || !user2Id) {
            res.status(400).json({ error: 'Both user IDs are required' });
            return;
        }

        const chatHistory = await messageService.getChatHistory(
            Number(user1Id),
            Number(user2Id),
            Number(limit),
            beforeMessageId ? Number(beforeMessageId) : undefined
        );
        res.status(200).json(chatHistory);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get User Chat List
export const getUserChatList = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const chatList = await messageService.getUserChatList(Number(userId));
        res.status(200).json(chatList);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get Unread Message Count
export const getUnreadMessageCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const unreadCount = await messageService.getUnreadMessageCount(Number(userId));
        res.status(200).json(unreadCount);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }

};
// ➡️ Create Group
export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, createdBy, initialMembers } = req.body;
        if (!name || !description || !createdBy) {
            res.status(400).json({ error: 'Name, description, and createdBy are required' });
            return;
        }

        const group = await messageService.createGroup(name, description, createdBy, initialMembers);
        res.status(201).json({ message: 'Group created successfully', group });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Delete Group
export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            res.status(400).json({ error: 'Group ID and User ID are required' });
            return;
        }

        const result = await messageService.deleteGroup(groupId, userId);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Join Group
export const joinGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            res.status(400).json({ error: 'Group ID and User ID are required' });
            return;
        }

        const result = await messageService.joinGroup(groupId, userId);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Leave Group
export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            res.status(400).json({ error: 'Group ID and User ID are required' });
            return;
        }

        const result = await messageService.leaveGroup(groupId, userId);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Change Group Admin Status
export const changeGroupAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, adminId, userId, makeAdmin } = req.body;
        if (!groupId || !adminId || !userId || makeAdmin === undefined) {
            res.status(400).json({ error: 'Group ID, Admin ID, User ID, and makeAdmin are required' });
            return;
        }

        const result = await messageService.changeGroupAdmin(groupId, adminId, userId, makeAdmin);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Send Group Message
export const sendGroupMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, senderId, content, contentType, mediaUrl } = req.body;
        if (!groupId || !senderId || !content) {
            res.status(400).json({ error: 'Group ID, Sender ID, and content are required' });
            return;
        }

        const message = await messageService.sendGroupMessage(groupId, senderId, content, contentType, mediaUrl);
        res.status(201).json({ message: 'Group message sent successfully', data: message });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get Group Messages
export const getGroupMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, userId } = req.params;
        const { limit = 50, beforeMessageId } = req.query;

        if (!groupId || !userId) {
            res.status(400).json({ error: 'Group ID and User ID are required' });
            return;
        }

        const messages = await messageService.getGroupMessages(
            Number(groupId),
            Number(userId),
            Number(limit),
            beforeMessageId ? Number(beforeMessageId) : undefined
        );
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get User Groups
export const getUserGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const groups = await messageService.getUserGroups(Number(userId));
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get Group Members
export const getGroupMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, userId } = req.params;
        if (!groupId || !userId) {
            res.status(400).json({ error: 'Group ID and User ID are required' });
            return;
        }

        const members = await messageService.getGroupMembers(Number(groupId), Number(userId));
        res.status(200).json(members);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Send Group Invite
export const sendGroupInvite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, senderId, receiverId } = req.body;
        if (!groupId || !senderId || !receiverId) {
            res.status(400).json({ error: 'Group ID, Sender ID, and Receiver ID are required' });
            return;
        }

        const result = await messageService.sendGroupInvite(groupId, senderId, receiverId);
        res.status(201).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
