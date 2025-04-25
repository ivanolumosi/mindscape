import { Request, Response } from 'express';
import { PostService } from '../services/postService';

const postService = new PostService();

// Helper
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'An unknown error occurred';
};

// ➡️ Create a Post
export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, content, contentType, mediaUrl } = req.body;
        if (!userId || !content) {
            res.status(400).json({ error: 'User ID and content are required' });
            return;
        }

        const post = await postService.createPost(userId, content, contentType, mediaUrl);
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Update a Post
export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, userId, content, contentType, mediaUrl } = req.body;
        if (!postId || !userId || !content) {
            res.status(400).json({ error: 'Post ID, User ID, and content are required' });
            return;
        }

        const result = await postService.updatePost(postId, userId, content, contentType, mediaUrl);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Delete a Post
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, userId } = req.body;
        if (!postId || !userId) {
            res.status(400).json({ error: 'Post ID and User ID are required' });
            return;
        }

        const result = await postService.deletePost(postId, userId);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Add a Comment
export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, userId, content, contentType, mediaUrl } = req.body;
        if (!postId || !userId || !content) {
            res.status(400).json({ error: 'Post ID, User ID, and content are required' });
            return;
        }

        const comment = await postService.addComment(postId, userId, content, contentType, mediaUrl);
        res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Update a Comment
export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { commentId, userId, content, contentType, mediaUrl } = req.body;
        if (!commentId || !userId || !content) {
            res.status(400).json({ error: 'Comment ID, User ID, and content are required' });
            return;
        }

        const result = await postService.updateComment(commentId, userId, content, contentType, mediaUrl);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Delete a Comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { commentId, userId } = req.body;
        if (!commentId || !userId) {
            res.status(400).json({ error: 'Comment ID and User ID are required' });
            return;
        }

        const result = await postService.deleteComment(commentId, userId);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get Post with Comments
export const getPostWithComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        if (!postId) {
            res.status(400).json({ error: 'Post ID is required' });
            return;
        }

        const result = await postService.getPostWithComments(Number(postId));
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get User Timeline
export const getUserTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { page = 1, pageSize = 10 } = req.query;

        const posts = await postService.getUserTimeline(Number(userId), Number(page), Number(pageSize));
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ➡️ Get User Feed
export const getFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { page = 1, pageSize = 10, includeCounselors = true } = req.query;

        const feed = await postService.getFeed(
            Number(userId),
            Number(page),
            Number(pageSize),
            includeCounselors === 'true'
        );
        res.status(200).json(feed);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
