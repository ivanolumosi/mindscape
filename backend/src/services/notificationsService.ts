import { poolPromise } from '../db';
import * as sql from 'mssql';

class NotificationsService {
    
    // ✅ Notify When a User Comments on a Post
    public async notifyPostComment(userId: number, commenterId: number, postId: number): Promise<void> {
        try {
            const query = `EXEC NotifyPostComment @user_id, @commenter_id, @post_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('user_id', sql.Int, userId)
                .input('commenter_id', sql.Int, commenterId)
                .input('post_id', sql.Int, postId)
                .query(query);
        } catch (error) {
            console.error('Error notifying about post comment:', error);
            throw new Error('Failed to notify about post comment');
        }
    }

    // ✅ Notify When a User Successfully Signs In
    public async notifySuccessfulSignIn(userId: number): Promise<void> {
        try {
            const query = `EXEC NotifySuccessfulSignIn @user_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
        } catch (error) {
            console.error('Error notifying successful sign-in:', error);
            throw new Error('Failed to notify successful sign-in');
        }
    }

    // ✅ Notify When a Friend Request is Sent
    public async notifyFriendRequestSent(senderId: number, receiverId: number): Promise<void> {
        try {
            const query = `EXEC NotifyFriendRequestSent @sender_id, @receiver_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
        } catch (error) {
            console.error('Error notifying friend request sent:', error);
            throw new Error('Failed to notify friend request sent');
        }
    }

    // ✅ Notify When a Friend Request is Received
    public async notifyFriendRequestReceived(receiverId: number): Promise<void> {
        try {
            const query = `EXEC NotifyFriendRequestReceived @receiver_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
        } catch (error) {
            console.error('Error notifying friend request received:', error);
            throw new Error('Failed to notify friend request received');
        }
    }

    // ✅ Notify When a New Crisis is Reported
    public async notifyNewCrisisReported(seekerId: number, counselorId: number, crisisId: number): Promise<void> {
        try {
            const query = `EXEC NotifyNewCrisisReported @seeker_id, @counselor_id, @crisis_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('seeker_id', sql.Int, seekerId)
                .input('counselor_id', sql.Int, counselorId)
                .input('crisis_id', sql.Int, crisisId)
                .query(query);
        } catch (error) {
            console.error('Error notifying new crisis reported:', error);
            throw new Error('Failed to notify new crisis report');
        }
    }

    // ✅ Notify When a New Chat Message is Sent
    public async notifyNewChatMessage(senderId: number, receiverId: number): Promise<void> {
        try {
            const query = `EXEC NotifyNewChatMessage @sender_id, @receiver_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
        } catch (error) {
            console.error('Error notifying new chat message:', error);
            throw new Error('Failed to notify new chat message');
        }
    }

    // ✅ Notify Users When Counselors Are Available
    public async notifyUsersOnAvailableCounselors(): Promise<void> {
        try {
            const query = `EXEC NotifyUsersOnAvailableCounselors;`;
            const pool = await poolPromise;
            await pool.request().query(query);
        } catch (error) {
            console.error('Error notifying users about available counselors:', error);
            throw new Error('Failed to send notifications about available counselors');
        }
    }

    // ✅ Notify User About Assessment Result
    public async notifyAssessmentResult(userId: number, assessmentTitle: string, score: number): Promise<void> {
        try {
            const query = `EXEC NotifyAssessmentResult @user_id, @assessment_title, @score;`;
            const pool = await poolPromise;
            await pool.request()
                .input('user_id', sql.Int, userId)
                .input('assessment_title', sql.NVarChar(255), assessmentTitle)
                .input('score', sql.Int, score)
                .query(query);
        } catch (error) {
            console.error('Error notifying assessment result:', error);
            throw new Error('Failed to notify assessment result');
        }
    }

    // ✅ Notify Users About a New Post
    public async notifyNewPost(postId: number, authorId: number): Promise<void> {
        try {
            const query = `EXEC NotifyNewPost @post_id, @author_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('post_id', sql.Int, postId)
                .input('author_id', sql.Int, authorId)
                .query(query);
        } catch (error) {
            console.error('Error notifying new post:', error);
            throw new Error('Failed to notify new post');
        }
    }

    // ✅ Get All Notifications for a User
    public async getAllUserNotifications(userId: number): Promise<any[]> {
        try {
            const query = `EXEC GetAllUserNotifications @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            throw new Error('Failed to fetch user notifications');
        }
    }

    // ✅ Get Friend Request Notifications
    public async getFriendRequestNotifications(userId: number): Promise<any[]> {
        try {
            const query = `EXEC GetFriendRequestNotifications @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching friend request notifications:', error);
            throw new Error('Failed to fetch friend request notifications');
        }
    }

    // ✅ Get Notifications by User ID
    public async getNotificationsByUserId(userId: number): Promise<any[]> {
        try {
            const query = `EXEC GetNotificationsByUserId @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching notifications by user ID:', error);
            throw new Error('Failed to fetch notifications');
        }
    }

    // ✅ Delete a Notification
    public async deleteNotification(notificationId: number): Promise<void> {
        try {
            const query = `EXEC DeleteNotification @notification_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('notification_id', sql.Int, notificationId)
                .query(query);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw new Error('Failed to delete notification');
        }
    }
}

export default new NotificationsService();
