import express from 'express';
import * as chatController from '../controllers/chatApplicationController';

const router = express.Router();

// ✅ Posts
router.post('/posts', chatController.addPost);           // Create a new post
router.get('/posts', chatController.getAllPosts);        // Get all posts
router.put('/posts', chatController.updatePost);         // Update a post

// ✅ Comments
router.post('/comments', chatController.addComment);              // Add a comment
router.get('/comments/:postId', chatController.getCommentsByPost); // Get comments by post
router.put('/comments', chatController.updateComment);            // Update a comment

// ✅ Direct Messages
router.post('/messages', chatController.sendDirectMessage);        // Send a direct message
router.post('/messages/reply', chatController.replyToDirectMessage); // Reply to a message
router.get('/messages/unread/:receiverId', chatController.getUnreadMessages); // Get unread messages
router.patch('/messages/read/:messageId', chatController.markMessageAsRead);  // Mark message as read
router.get('/messages/:user1Id/:user2Id', chatController.getMessagesBetweenUsers); // Get conversation between users


//  Posts
router.delete('/posts/:postId', chatController.deletePost);

// ✅ Comments
router.delete('/comments/:commentId', chatController.deleteComment);

// ✅ Direct Messages
router.delete('/messages/:user1Id/:user2Id', chatController.deleteMessagesBetweenUsers);
router.delete('/messages/old', chatController.deleteOldMessages);

export default router;
