import express from 'express';
import * as dailyJournalController from '../controllers/dailyJournalController';

const router = express.Router();


router.post('/', dailyJournalController.addJournalEntry);
router.delete('/:id', dailyJournalController.deleteJournalEntry);
router.get('/all', dailyJournalController.getAllJournalEntries);
router.get('/:id', dailyJournalController.getJournalEntryById);

router.get('/user/:userId', dailyJournalController.getJournalEntriesByUser);

router.get('/user/:userId/date-range', dailyJournalController.getJournalEntriesByDateRange);

router.get('/user/:userId/stats', dailyJournalController.getJournalStatistics);

router.patch('/:id', dailyJournalController.updateJournalEntry);

export default router;
