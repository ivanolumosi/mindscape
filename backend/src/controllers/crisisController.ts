import { Request, Response } from 'express';
import crisisService from '../services/crisisService';

// Helper function to extract error messages
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'An unknown error occurred';
};

// ✅ Create a Crisis Report
export const createCrisisReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { seekerId, crisisType, description, priority } = req.body;

        if (!seekerId || !crisisType || !description) {
            res.status(400).json({ error: 'Seeker ID, crisis type, and description are required' });
            return;
        }

        const crisisId = await crisisService.createCrisisReport(seekerId, crisisType, description, priority);
        res.status(201).json({ message: 'Crisis report created successfully', crisisId });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Assign a Counselor to a Crisis
export const assignCounselor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crisisId, counselorId } = req.body;

        if (!crisisId || !counselorId) {
            res.status(400).json({ error: 'Crisis ID and Counselor ID are required' });
            return;
        }

        const updatedCrisis = await crisisService.assignCounselor(crisisId, counselorId);
        res.status(200).json({ message: 'Counselor assigned successfully', updatedCrisis });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Update Crisis Status
export const updateCrisisStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crisisId, status, resolvedAt } = req.body;

        if (!crisisId || !status) {
            res.status(400).json({ error: 'Crisis ID and status are required' });
            return;
        }

        const updatedCrisis = await crisisService.updateCrisisStatus(crisisId, status, resolvedAt);
        res.status(200).json({ message: 'Crisis status updated successfully', updatedCrisis });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Log a Crisis Call
export const logCrisisCall = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crisisId, callerId, callStart, callType } = req.body;

        if (!crisisId || !callerId || !callStart || !callType) {
            res.status(400).json({ error: 'Crisis ID, caller ID, call start time, and call type are required' });
            return;
        }

        const callId = await crisisService.logCrisisCall(crisisId, callerId, new Date(callStart), callType);
        res.status(201).json({ message: 'Crisis call logged successfully', callId });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Log a Crisis Chat Message
export const logCrisisChatMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crisisId, senderId, message } = req.body;

        if (!crisisId || !senderId || !message) {
            res.status(400).json({ error: 'Crisis ID, sender ID, and message are required' });
            return;
        }

        const messageId = await crisisService.logCrisisChatMessage(crisisId, senderId, message);
        res.status(201).json({ message: 'Crisis chat message logged successfully', messageId });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a Crisis
export const deleteCrisis = async (req: Request, res: Response): Promise<void> => {
    try {
        const crisisId = parseInt(req.params.crisisId, 10);
        if (!crisisId) {
            res.status(400).json({ error: 'Crisis ID is required' });
            return;
        }

        await crisisService.deleteCrisis(crisisId);
        res.status(200).json({ message: 'Crisis deleted successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a Crisis Call
export const deleteCrisisCall = async (req: Request, res: Response): Promise<void> => {
    try {
        const callId = parseInt(req.params.callId, 10);
        if (!callId) {
            res.status(400).json({ error: 'Call ID is required' });
            return;
        }

        await crisisService.deleteCrisisCall(callId);
        res.status(200).json({ message: 'Crisis call deleted successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a Crisis Chat Message
export const deleteCrisisChatMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const messageId = parseInt(req.params.messageId, 10);
        if (!messageId) {
            res.status(400).json({ error: 'Message ID is required' });
            return;
        }

        await crisisService.deleteCrisisChatMessage(messageId);
        res.status(200).json({ message: 'Crisis chat message deleted successfully' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};


// ✅ Change Crisis Status
export const changeCrisisStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crisisId, status, resolvedAt } = req.body;
        const updatedCrisis = await crisisService.changeCrisisStatus(crisisId, status, resolvedAt);
        res.status(200).json(updatedCrisis);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get All Crisis Calls for a User
export const getAllCrisisCallsForUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const calls = await crisisService.getAllCrisisCallsForUser(userId);
        res.status(200).json(calls);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get All Crisis Chats by a User
export const getAllCrisisChatsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const chats = await crisisService.getAllCrisisChatsByUser(userId);
        res.status(200).json(chats);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get All Crisis Calls
export const getAllCrisisCalls = async (_req: Request, res: Response): Promise<void> => {
    try {
        const calls = await crisisService.getAllCrisisCalls();
        res.status(200).json(calls);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get All Crisis Chats
export const getAllCrisisChats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const chats = await crisisService.getAllCrisisChats();
        res.status(200).json(chats);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
