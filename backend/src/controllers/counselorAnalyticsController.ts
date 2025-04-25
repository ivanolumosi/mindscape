import { Request, Response } from 'express';
import { CounselorAnalyticsService } from '../services/CounselorAnalyticsService';

const analyticsService = new CounselorAnalyticsService();

const getErrorMessage = (err: unknown): string => {
    return err instanceof Error ? err.message : 'An unknown error occurred';
};

// ✅ Get Recommended Counselors
export const getRecommendedCounselors = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const limit = parseInt(req.query.limit as string, 10) || 5;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const counselors = await analyticsService.getRecommendedCounselors(userId, limit);
        res.status(200).json(counselors);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Search Users
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query, userType } = req.query;
        const userId = parseInt(req.params.userId, 10);
        const limit = parseInt(req.query.limit as string, 10) || 10;

        if (!query || !userId) {
            res.status(400).json({ error: 'Search query and User ID are required' });
            return;
        }

        const results = await analyticsService.searchUsers(userId, query as string, userType as string, limit);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Send Emoji Reaction
export const sendEmojiReaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, contentType, contentId, emoji } = req.body;

        if (!userId || !contentType || !contentId || !emoji) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const result = await analyticsService.sendEmojiReaction(userId, contentType, contentId, emoji);
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Emoji Reactions
export const getEmojiReactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { contentType } = req.query;
        const contentId = parseInt(req.query.contentId as string, 10);

        if (!contentType || !contentId) {
            res.status(400).json({ error: 'Content type and ID are required' });
            return;
        }

        const reactions = await analyticsService.getEmojiReactions(contentType as string, contentId);
        res.status(200).json(reactions);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get User Activity Stats
export const getUserActivityStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const stats = await analyticsService.getUserActivityStats(userId);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Mental Health Resources
export const getMentalHealthResources = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = req.query.category as string;

        const resources = await analyticsService.getMentalHealthResources(category);
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Find Similar Users
export const findSimilarUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const limit = parseInt(req.query.limit as string, 10) || 5;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const users = await analyticsService.findSimilarUsers(userId, limit);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
export const viewSeekers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const seekers = await analyticsService.viewSeekers();
        res.status(200).json(seekers);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const createSeeker = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, faculty } = req.body;
        if (!name || !email || !password || !faculty) {
            res.status(400).json({ error: 'All seeker fields are required' });
            return;
        }

        await analyticsService.createSeeker(name, email, password, faculty);
        res.status(201).json({ message: 'Seeker created successfully' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const updateSeeker = async (req: Request, res: Response): Promise<void> => {
    try {
        const seekerId = parseInt(req.params.id, 10);
        const { name, email, faculty } = req.body;
        if (!seekerId || !name || !email || !faculty) {
            res.status(400).json({ error: 'Missing seeker details' });
            return;
        }

        await analyticsService.updateSeeker(seekerId, name, email, faculty);
        res.status(200).json({ message: 'Seeker updated successfully' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const deleteSeeker = async (req: Request, res: Response): Promise<void> => {
    try {
        const seekerId = parseInt(req.params.id, 10);
        await analyticsService.deleteSeeker(seekerId);
        res.status(200).json({ message: 'Seeker deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ---------------------
// 💬 Messages
// ---------------------

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { senderId, receiverId, content, parentMessageId } = req.body;
        if (!senderId || !receiverId || !content) {
            res.status(400).json({ error: 'Missing message details' });
            return;
        }

        await analyticsService.sendMessage(senderId, receiverId, content, parentMessageId);
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const viewMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const counselorId = parseInt(req.params.counselorId, 10);
        const seekerId = parseInt(req.params.seekerId, 10);
        const messages = await analyticsService.viewMessages(counselorId, seekerId);
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const markMessageRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const messageId = parseInt(req.params.messageId, 10);
        await analyticsService.markMessageRead(messageId);
        res.status(200).json({ message: 'Message marked as read' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ---------------------
// 📅 Availability
// ---------------------

export const setAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const { counselorId, day, startTime, endTime } = req.body;

        if (!counselorId || !day || !startTime || !endTime) {
            res.status(400).json({ error: 'All availability fields are required' });
            return;
        }

        await analyticsService.addOrUpdateAvailability(counselorId, day, startTime, endTime);
        res.status(200).json({ message: 'Availability set/updated' });
    } catch (err) {
        console.error('Controller error:', err);
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const checkSlotAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const { counselorId, date, startTime, endTime } = req.body;
        if (!counselorId || !date || !startTime || !endTime) {
            res.status(400).json({ error: 'Missing time slot fields' });
            return;
        }

        await analyticsService.checkSlotAvailability(counselorId, date, startTime, endTime);
        res.status(200).json({ message: 'Slot availability checked' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ---------------------
// 📚 Sessions
// ---------------------

export const scheduleSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { counselorId, title, venue, date, startTime, endTime, description, maxParticipants } = req.body;

        if (!counselorId || !title || !venue || !date || !startTime || !endTime) {
            res.status(400).json({ error: 'Missing session details' });
            return;
        }

        await analyticsService.scheduleSession(counselorId, title, venue, date, startTime, endTime, description, maxParticipants);
        res.status(201).json({ message: 'Session scheduled successfully' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const viewSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const counselorId = parseInt(req.params.counselorId, 10);
        const sessions = await analyticsService.viewSessions(counselorId);
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const cancelSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const sessionId = parseInt(req.params.sessionId, 10);
        const counselorId = parseInt(req.body.counselorId, 10);

        await analyticsService.cancelSession(sessionId, counselorId);
        res.status(200).json({ message: 'Session cancelled' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getWeeklyTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        const counselorId = parseInt(req.params.counselorId, 10);
        const timetable = await analyticsService.getWeeklyTimetable(counselorId);
        res.status(200).json(timetable);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};