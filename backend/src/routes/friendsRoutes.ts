import express from 'express';
import * as friendsController from '../controllers/friendsController';

const router = express.Router();

router.post('/request', friendsController.sendFriendRequest);
router.put('/accept/:requestId', friendsController.acceptFriendRequest);
router.put('/reject/:requestId', friendsController.rejectFriendRequest);
router.delete('/remove', friendsController.removeFriend);
router.get('/list/:userId', friendsController.getFriendList);
router.get('/requests/:userId', friendsController.getIncomingFriendRequests);

export default router;
