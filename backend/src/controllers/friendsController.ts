import { Request, Response } from 'express';
import friendsService from '../services/friendsService';

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'An unknown error occurred';
};

// ✅ Send a Friend Request
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { senderId, receiverId } = req.body;
        await friendsService.sendFriendRequest(senderId, receiverId);
        res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Accept a Friend Request
export const acceptFriendRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestId = parseInt(req.params.requestId, 10);
        await friendsService.acceptFriendRequest(requestId);
        res.status(200).json({ message: 'Friend request accepted' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Reject a Friend Request
export const rejectFriendRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestId = parseInt(req.params.requestId, 10);
        await friendsService.rejectFriendRequest(requestId);
        res.status(200).json({ message: 'Friend request rejected' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Remove a Friend
export const removeFriend = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, friendId } = req.body;
        await friendsService.removeFriend(userId, friendId);
        res.status(200).json({ message: 'Friend removed successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Friend List
export const getFriendList = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const friends = await friendsService.getFriendList(userId);
        res.status(200).json(friends);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Incoming Friend Requests
export const getIncomingFriendRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const requests = await friendsService.getIncomingFriendRequests(userId);
        res.status(200).json(requests);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
