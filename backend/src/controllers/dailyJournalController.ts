import { Request, Response } from 'express';
import { DailyJournalService } from '../services/dailyJournalService';

const dailyJournalService = new DailyJournalService();

// ✅ Helper function for error messages
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'An unknown error occurred';
};

// ✅ Add a new daily journal entry
export const addJournalEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, entryDate, mood, reflections, gratitude } = req.body;
        if (!userId || !entryDate || !mood) {
            res.status(400).json({ error: 'User ID, entry date, and mood are required' });
            return;
        }

        const newEntry = await dailyJournalService.addJournalEntry(userId, new Date(entryDate), mood, reflections, gratitude);
        res.status(201).json({ message: 'Journal entry added successfully', entry: newEntry });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a journal entry by ID
export const deleteJournalEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const success = await dailyJournalService.deleteJournalEntry(parseInt(req.params.id, 10));
        success ? res.status(200).json({ message: 'Journal entry deleted successfully' }) : res.status(404).json({ error: 'Journal entry not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get a journal entry by ID
export const getJournalEntryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const entry = await dailyJournalService.getJournalEntryById(parseInt(req.params.id, 10));
        entry ? res.status(200).json(entry) : res.status(404).json({ error: 'Journal entry not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get all journal entries for a user
export const getJournalEntriesByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const entries = await dailyJournalService.getJournalEntriesByUser(parseInt(req.params.userId, 10));
        res.status(200).json(entries);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get journal entries within a date range
export const getJournalEntriesByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: 'Start date and end date are required' });
            return;
        }

        const entries = await dailyJournalService.getJournalEntriesByDateRange(parseInt(userId, 10), new Date(startDate as string), new Date(endDate as string));
        res.status(200).json(entries);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get journal statistics for a user
export const getJournalStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await dailyJournalService.getJournalStatistics(parseInt(req.params.userId, 10));
        res.status(200).json(stats);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getAllJournalEntries = async (_req: Request, res: Response): Promise<void> => {
    try {
        const entries = await dailyJournalService.getAllJournalEntries();
        res.status(200).json(entries);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};


// ✅ Update a journal entry
export const updateJournalEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mood, reflections, gratitude } = req.body;
        const updatedEntry = await dailyJournalService.updateJournalEntry(parseInt(req.params.id, 10), mood, reflections, gratitude);
        updatedEntry ? res.status(200).json({ message: 'Journal entry updated successfully', entry: updatedEntry }) : res.status(404).json({ error: 'Journal entry not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
