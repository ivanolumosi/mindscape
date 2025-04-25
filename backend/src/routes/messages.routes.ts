import { Router } from 'express';
import {
    sendDirectMessage,
    editDirectMessage,
    markMessageAsRead,
    getChatHistory,
    getUserChatList,
    getUnreadMessageCount,
    createGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    changeGroupAdmin,
    sendGroupMessage,
    getGroupMessages,
    getUserGroups,
    getGroupMembers,
    sendGroupInvite
} from '../controllers/messagesContoller';

const router = Router();

// ====================
// 📩 Direct Messaging
// ====================

router.post('/direct-message', sendDirectMessage);
router.put('/direct-message', editDirectMessage);
router.put('/direct-message/read', markMessageAsRead);
router.get('/chat-history/:user1Id/:user2Id', getChatHistory);
router.get('/chat-list/:userId', getUserChatList);
router.get('/unread-count/:userId', getUnreadMessageCount);

// ====================
// 👥 Groups
// ====================

router.post('/group', createGroup);
router.delete('/group', deleteGroup);
router.post('/group/join', joinGroup);
router.post('/group/leave', leaveGroup);
router.post('/group/admin', changeGroupAdmin);
router.post('/group/message', sendGroupMessage);
router.get('/group/messages/:groupId/:userId', getGroupMessages);
router.get('/groups/:userId', getUserGroups);
router.get('/group/members/:groupId/:userId', getGroupMembers);
router.post('/group/invite', sendGroupInvite);

export default router;
