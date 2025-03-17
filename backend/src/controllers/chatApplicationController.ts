import { Request, Response } from 'express';
import { ChatApplicationService } from '../services/chatApplicationService';

const chatService = new ChatApplicationService();

// Helper function to get error messages
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'An unknown error occurred';
};

// ✅ Add a New Post
export const addPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, content } = req.body;
        if (!userId || !content) {
            res.status(400).json({ error: 'User ID and content are required' });
            return;
        }

        const newPost = await chatService.addPost(userId, content);
        res.status(201).json({ message: 'Post added successfully', post: newPost });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Add a New Comment
export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, userId, content } = req.body;
        if (!postId || !userId || !content) {
            res.status(400).json({ error: 'Post ID, User ID, and content are required' });
            return;
        }

        const newComment = await chatService.addComment(postId, userId, content);
        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get All Posts
export const getAllPosts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const posts = await chatService.getAllPosts();
        res.status(200).json(posts);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Comments by Post ID
export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.postId, 10);
        if (!postId) {
            res.status(400).json({ error: 'Post ID is required' });
            return;
        }

        const comments = await chatService.getCommentsByPost(postId);
        res.status(200).json(comments);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Messages Between Two Users
export const getMessagesBetweenUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const user1Id = parseInt(req.params.user1Id, 10);
        const user2Id = parseInt(req.params.user2Id, 10);
        if (!user1Id || !user2Id) {
            res.status(400).json({ error: 'Both user IDs are required' });
            return;
        }

        const messages = await chatService.getMessagesBetweenUsers(user1Id, user2Id);
        res.status(200).json(messages);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Unread Messages
export const getUnreadMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const receiverId = parseInt(req.params.receiverId, 10);
        if (!receiverId) {
            res.status(400).json({ error: 'Receiver ID is required' });
            return;
        }

        const messages = await chatService.getUnreadMessages(receiverId);
        res.status(200).json(messages);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Mark a Message as Read
export const markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const messageId = parseInt(req.params.messageId, 10);
        if (!messageId) {
            res.status(400).json({ error: 'Message ID is required' });
            return;
        }

        await chatService.markMessageAsRead(messageId);
        res.status(200).json({ message: 'Message marked as read' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Reply to a Direct Message
export const replyToDirectMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { senderId, receiverId, content, parentMessageId } = req.body;
        if (!senderId || !receiverId || !content || !parentMessageId) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const newMessage = await chatService.replyToDirectMessage(senderId, receiverId, content, parentMessageId);
        res.status(201).json({ message: 'Reply sent successfully', reply: newMessage });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Send a Direct Message
export const sendDirectMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { senderId, receiverId, content } = req.body;
        if (!senderId || !receiverId || !content) {
            res.status(400).json({ error: 'Sender ID, Receiver ID, and content are required' });
            return;
        }

        const newMessage = await chatService.sendDirectMessage(senderId, receiverId, content);
        res.status(201).json({ message: 'Message sent successfully', messageData: newMessage });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Update a Comment
export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { commentId, content } = req.body;
        if (!commentId || !content) {
            res.status(400).json({ error: 'Comment ID and content are required' });
            return;
        }

        const updatedComment = await chatService.updateComment(commentId, content);
        res.status(200).json({ message: 'Comment updated successfully', comment: updatedComment });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Update a Post
export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, content } = req.body;
        if (!postId || !content) {
            res.status(400).json({ error: 'Post ID and content are required' });
            return;
        }

        const updatedPost = await chatService.updatePost(postId, content);
        res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
    
};
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.postId, 10);
        if (!postId) {
            res.status(400).json({ error: 'Post ID is required' });
            return;
        }

        await chatService.deletePost(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a Comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const commentId = parseInt(req.params.commentId, 10);
        if (!commentId) {
            res.status(400).json({ error: 'Comment ID is required' });
            return;
        }

        await chatService.deleteComment(commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete Messages Between Two Users
export const deleteMessagesBetweenUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const user1Id = parseInt(req.params.user1Id, 10);
        const user2Id = parseInt(req.params.user2Id, 10);
        if (!user1Id || !user2Id) {
            res.status(400).json({ error: 'Both user IDs are required' });
            return;
        }

        await chatService.deleteMessagesBetweenUsers(user1Id, user2Id);
        res.status(200).json({ message: 'Messages deleted successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete Old Messages (Older than 36 Hours)
export const deleteOldMessages = async (_req: Request, res: Response): Promise<void> => {
    try {
        await chatService.deleteOldMessages();
        res.status(200).json({ message: 'Old messages deleted successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};