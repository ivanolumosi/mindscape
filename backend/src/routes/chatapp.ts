import { Router } from 'express';
import {
    createOrUpdateUserProfile,
    getUserProfile,
    deleteUser,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriendList,
    getPendingFriendRequests,
    getRecommendedFriends
} from '../controllers/chatappcontroller';

const router = Router();

// User profile
router.post('/user', createOrUpdateUserProfile);
router.get('/user/:userId', getUserProfile);
router.delete('/user/:userId', deleteUser);

// Friendships
router.post('/friend-request/send', sendFriendRequest);
router.post('/friend-request/respond', respondToFriendRequest);
router.delete('/friend-request/:requestId', cancelFriendRequest);
router.post('/friend/remove', removeFriend);

// Friends listing
router.get('/friends/:userId', getFriendList);
router.get('/friend-requests/:userId', getPendingFriendRequests);
router.get('/recommended-friends/:userId', getRecommendedFriends);

export default router;
