import express from 'express';
import * as moodTrackerController from '../controllers/moodTrackerController';

const router = express.Router();

// ✅ Add a new mood entry
router.post('/', moodTrackerController.addMoodEntry);

// ✅ Delete a mood entry by ID
router.delete('/:id', moodTrackerController.deleteMoodEntry);

// ✅ Get all mood entries for a specific user
router.get('/user/:userId', moodTrackerController.getMoodByUserId);

// ✅ Get all mood entries (for all users)
router.get('/all', moodTrackerController.getAllUserMoods);

// ✅ Get mood entries by date range
router.get('/user/:userId/date-range', moodTrackerController.getMoodEntriesByDateRange);

// ✅ Get mood statistics for a user
router.get('/user/:userId/stats', moodTrackerController.getMoodStatistics);

// ✅ Update a mood entry by ID
router.patch('/:id', moodTrackerController.updateMoodEntry);

export default router;
