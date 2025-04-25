import { Request, Response } from 'express';
import { UserProfileService } from '../services/UserProfileService';
import { Friend } from '../interfaces/Friend';

const userService = new UserProfileService();

// Helper function to get error messages
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'An unknown error occurred';
};

// ✅ Create or Update User Profile
export const createOrUpdateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            id, name, email, password, role,
            profileImage, specialization, faculty,
            privileges, availabilitySchedule, nickname
        } = req.body;

        if (!name || !email || !password || !role) {
            res.status(400).json({ error: 'Name, email, password, and role are required' });
            return;
        }

        const userId = await userService.createUpdateUserProfile(
            name, email, password, role, profileImage,
            specialization, faculty, privileges,
            availabilitySchedule, nickname, id
        );

        res.status(201).json({ message: 'User profile saved successfully', userId });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get User Profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const user = await userService.getUserProfile(userId);
        res.status(200).json(user);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete User
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const result = await userService.deleteUser(userId);
        res.status(200).json({ message: result });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Send Friend Request
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            res.status(400).json({ error: 'Sender ID and Receiver ID are required' });
            return;
        }

        const result = await userService.sendFriendRequest(senderId, receiverId);
        res.status(200).json({ message: result });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Respond to Friend Request
export const respondToFriendRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestId, response } = req.body;
        if (!requestId || !response) {
            res.status(400).json({ error: 'Request ID and response are required' });
            return;
        }

        const result = await userService.respondToFriendRequest(requestId, response);
        res.status(200).json({ message: result });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Cancel Friend Request
export const cancelFriendRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestId = parseInt(req.params.requestId, 10);
        if (!requestId) {
            res.status(400).json({ error: 'Request ID is required' });
            return;
        }

        const result = await userService.cancelFriendRequest(requestId);
        res.status(200).json({ message: result });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Remove Friend
export const removeFriend = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, friendId } = req.body;
        if (!userId || !friendId) {
            res.status(400).json({ error: 'User ID and Friend ID are required' });
            return;
        }

        const result = await userService.removeFriend(userId, friendId);
        res.status(200).json({ message: result });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getFriendList = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid or missing User ID' });
            return;
        }

        const friends: Friend[] = await userService.getFriendList(userId);

        res.status(200).json({
            message: 'Friend list retrieved successfully',
            friends
        });

    } catch (err: unknown) {
        console.error('Error in getFriendList:', err);
        res.status(500).json({ error: getErrorMessage(err) });
    }
}
// ✅ Get Pending Friend Requests
export const getPendingFriendRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const requestType = req.query.requestType as string || 'all';

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const requests = await userService.getPendingFriendRequests(userId, requestType);
        res.status(200).json(requests);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Recommended Friends
export const getRecommendedFriends = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const recommendationType = req.query.recommendationType as string || 'all';
        const limit = parseInt(req.query.limit as string, 10) || 10;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const recommended = await userService.getRecommendedFriends(userId, recommendationType, limit);
        res.status(200).json(recommended);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
