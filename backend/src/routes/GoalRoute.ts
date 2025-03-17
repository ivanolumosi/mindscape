import express from 'express';
import * as goalController from '../controllers/GoalController';

const router = express.Router();

// ✅ Define routes
router.post('/', goalController.addGoal);
router.delete('/:goalId', goalController.deleteGoal);
router.get('/user/:userId', goalController.getGoalsByUserId);
router.get('/user/:userId/status', goalController.getGoalsByStatus);
router.get('/:goalId', goalController.getGoalById);
router.get('/:goalId/progress', goalController.trackGoalProgress);
router.patch('/:goalId/status', goalController.updateGoalStatus);

// ✅ Export router
export default router;
