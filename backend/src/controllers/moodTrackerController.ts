import { Request, Response } from 'express';
import { MoodTrackerService } from '../services/moodTrackerService';

const moodTrackerService = new MoodTrackerService();

// ✅ Helper function for error messages
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'An unknown error occurred';
};

// ✅ Add a new mood entry
export const addMoodEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, mood, notes } = req.body;
        if (!userId || !mood) {
            res.status(400).json({ error: 'User ID and mood are required' });
            return;
        }

        const newMoodEntry = await moodTrackerService.addMoodEntry(userId, mood, notes);
        res.status(201).json({ message: 'Mood entry added successfully', moodEntry: newMoodEntry });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a mood entry by ID
export const deleteMoodEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid mood entry ID' });
            return;
        }

        const success = await moodTrackerService.deleteMoodEntry(id);
        success ? res.status(200).json({ message: 'Mood entry deleted successfully' }) : res.status(404).json({ error: 'Mood entry not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get all mood entries for a specific user
export const getMoodByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }

        const moods = await moodTrackerService.getMoodByUserId(userId);
        res.status(200).json(moods);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get all mood entries (for all users)
export const getAllUserMoods = async (_req: Request, res: Response): Promise<void> => {
    try {
        const moods = await moodTrackerService.getAllUserMoods();
        res.status(200).json(moods);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get mood entries by date range
export const getMoodEntriesByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const { startDate, endDate } = req.query;

        if (isNaN(userId) || !startDate || !endDate) {
            res.status(400).json({ error: 'User ID, startDate, and endDate are required' });
            return;
        }

        const moodEntries = await moodTrackerService.getMoodEntriesByDateRange(
            userId,
            new Date(startDate as string),
            new Date(endDate as string)
        );

        res.status(200).json(moodEntries);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get mood statistics for a user
export const getMoodStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }

        const moodStats = await moodTrackerService.getMoodStatistics(userId);
        res.status(200).json(moodStats);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Update a mood entry
export const updateMoodEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const { mood, notes } = req.body;

        if (isNaN(id) || !mood) {
            res.status(400).json({ error: 'Valid mood entry ID and mood are required' });
            return;
        }

        const updatedMoodEntry = await moodTrackerService.updateMoodEntry(id, mood, notes);
        updatedMoodEntry
            ? res.status(200).json({ message: 'Mood entry updated successfully', moodEntry: updatedMoodEntry })
            : res.status(404).json({ error: 'Mood entry not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
