import { Request, Response } from 'express';
import { GoalService } from '../services/GoalService';
import { Goal } from '../interfaces/Goal';

const goalService = new GoalService();

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
        return err.message;
    } else if (typeof err === 'string') {
        return err;
    } else {
        return 'An unknown error occurred';
    }
};

export const addGoal = async (req: Request, res: Response) => {
    try {
        const { userId, goalTitle, goalDescription, goalType, dueDate } = req.body;
        const newGoal: Goal = await goalService.addGoal(userId, goalTitle, goalDescription, goalType, dueDate);
        res.status(201).json({ message: 'Goal added successfully', goal: newGoal });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const deleteGoal = async (req: Request, res: Response) => {
    try {
        const success = await goalService.deleteGoal(parseInt(req.params.goalId, 10));
        if (success) {
            res.status(200).json({ message: 'Goal deleted successfully' });
        } else {
            res.status(404).json({ error: 'Goal not found' });
        }
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getGoalsByUserId = async (req: Request, res: Response) => {
    try {
        const goals: Goal[] = await goalService.getGoalsByUserId(parseInt(req.params.userId, 10));
        res.status(200).json(goals);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getGoalsByStatus = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const isCompleted = req.query.isCompleted === 'true';
        const goals: Goal[] = await goalService.getGoalsByStatus(userId, isCompleted);
        res.status(200).json(goals);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getGoalById = async (req: Request, res: Response) => {
    try {
        const goal = await goalService.getGoalById(parseInt(req.params.goalId, 10));
        if (goal) {
            res.status(200).json(goal);
        } else {
            res.status(404).json({ error: 'Goal not found' });
        }
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const trackGoalProgress = async (req: Request, res: Response) => {
    try {
        const progress = await goalService.trackGoalProgress(parseInt(req.params.goalId, 10));
        res.status(200).json(progress);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const updateGoalStatus = async (req: Request, res: Response) => {
    try {
        const { isCompleted, progressPercentage } = req.body;
        const updatedGoal = await goalService.updateGoalStatus(
            parseInt(req.params.goalId, 10),
            isCompleted,
            progressPercentage
        );

        if (updatedGoal) {
            res.status(200).json({ message: 'Goal status updated successfully', goal: updatedGoal });
        } else {
            res.status(404).json({ error: 'Goal not found' });
        }
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
