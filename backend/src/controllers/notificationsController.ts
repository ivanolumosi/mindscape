import { Request, Response } from 'express';
import notificationsService from '../services/notificationsService';

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'An unknown error occurred';
};

// ✅ Notify When a User Comments on a Post
export const notifyPostComment = async (req: Request, res: Response) => {
    try {
        const { userId, commenterId, postId } = req.body;
        await notificationsService.notifyPostComment(userId, commenterId, postId);
        res.status(200).json({ message: 'Notification sent for post comment' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Notify When a User Successfully Signs In
export const notifySuccessfulSignIn = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        await notificationsService.notifySuccessfulSignIn(userId);
        res.status(200).json({ message: 'Sign-in notification sent' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Notify When a Friend Request is Sent
export const notifyFriendRequestSent = async (req: Request, res: Response) => {
    try {
        const { senderId, receiverId } = req.body;
        await notificationsService.notifyFriendRequestSent(senderId, receiverId);
        res.status(200).json({ message: 'Friend request notification sent' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Notify When a Friend Request is Received
export const notifyFriendRequestReceived = async (req: Request, res: Response) => {
    try {
        const { receiverId } = req.body;
        await notificationsService.notifyFriendRequestReceived(receiverId);
        res.status(200).json({ message: 'Friend request received notification sent' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Notify Users When Counselors Are Available
export const notifyUsersOnAvailableCounselors = async (req: Request, res: Response) => {
    try {
        await notificationsService.notifyUsersOnAvailableCounselors();
        res.status(200).json({ message: 'Users have been notified about available counselors' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get All Notifications for a User
export const getAllUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const notifications = await notificationsService.getAllUserNotifications(userId);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get Friend Request Notifications
export const getFriendRequestNotifications = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const notifications = await notificationsService.getFriendRequestNotifications(userId);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a Notification
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const notificationId = parseInt(req.params.notificationId);
        await notificationsService.deleteNotification(notificationId);
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
