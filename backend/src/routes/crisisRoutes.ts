import express from 'express';
import * as crisisController from '../controllers/crisisController';

const router = express.Router();

// ✅ Crisis Management
router.post('/report', crisisController.createCrisisReport); // Report a new crisis
router.put('/assign', crisisController.assignCounselor); // Assign a counselor to a crisis
router.put('/status', crisisController.updateCrisisStatus); // Update crisis status
router.delete('/:crisisId', crisisController.deleteCrisis); // Delete a crisis

// ✅ Crisis Calls
router.post('/calls', crisisController.logCrisisCall); // Log a crisis call
router.delete('/calls/:callId', crisisController.deleteCrisisCall); // Delete a crisis call

// ✅ Crisis Chat
router.post('/chats', crisisController.logCrisisChatMessage); // Log a chat message
router.delete('/chats/:messageId', crisisController.deleteCrisisChatMessage); // Delete a chat message

router.put('/status', crisisController.changeCrisisStatus);
router.get('/calls/user/:userId', crisisController.getAllCrisisCallsForUser);
router.get('/chats/user/:userId', crisisController.getAllCrisisChatsByUser);
router.get('/calls', crisisController.getAllCrisisCalls);
router.get('/chats', crisisController.getAllCrisisChats);

export default router;
