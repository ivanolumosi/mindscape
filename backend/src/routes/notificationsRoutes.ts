import express from 'express';
import * as notificationsController from '../controllers/notificationsController';

const router = express.Router();

// ✅ Notify Events
router.post('/notify/comment', notificationsController.notifyPostComment);
router.post('/notify/signin', notificationsController.notifySuccessfulSignIn);
router.post('/notify/friend-request-sent', notificationsController.notifyFriendRequestSent);
router.post('/notify/friend-request-received', notificationsController.notifyFriendRequestReceived);
router.post('/notify/available-counselors', notificationsController.notifyUsersOnAvailableCounselors);

// ✅ Get Notifications
router.get('/user/:userId', notificationsController.getAllUserNotifications);
router.get('/friend-requests/:userId', notificationsController.getFriendRequestNotifications);

// ✅ Delete Notification
router.delete('/:notificationId', notificationsController.deleteNotification);

export default router;
