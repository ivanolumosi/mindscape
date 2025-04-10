import { poolPromise } from '../db';
import * as sql from 'mssql';
import { Goal } from '../interfaces/Goal';

export class GoalService {
    public async addGoal(userId: number, goalTitle: string, goalDescription: string | null, goalType: 'Daily' | 'Weekly' | 'Monthly', dueDate: Date | null): Promise<Goal> {
        const query = `
            INSERT INTO Goals (user_id, goal_title, goal_description, goal_type, due_date, progress_percentage, is_completed, created_at, updated_at)
            VALUES (@userId, @goalTitle, @goalDescription, @goalType, @dueDate, 0, 0, GETDATE(), GETDATE());
            SELECT * FROM Goals WHERE id = SCOPE_IDENTITY();
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('goalTitle', sql.NVarChar(255), goalTitle)
            .input('goalDescription', sql.NVarChar(sql.MAX), goalDescription)
            .input('goalType', sql.NVarChar(50), goalType)
            .input('dueDate', sql.DateTime, dueDate)
            .query(query);

        return result.recordset[0];
    }

    public async deleteGoal(goalId: number): Promise<boolean> {
        const query = 'DELETE FROM Goals WHERE id = @goalId';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('goalId', sql.Int, goalId)
            .query(query);

        return result.rowsAffected[0] > 0;
    }

    public async getGoalsByUserId(userId: number): Promise<Goal[]> {
        const query = 'SELECT * FROM Goals WHERE user_id = @userId';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);

        return result.recordset;
    }

    public async getGoalsByStatus(userId: number, isCompleted: boolean): Promise<Goal[]> {
        const query = 'SELECT * FROM Goals WHERE user_id = @userId AND is_completed = @isCompleted';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('isCompleted', sql.Bit, isCompleted)
            .query(query);

        return result.recordset;
    }

    public async getGoalById(goalId: number): Promise<Goal | null> {
        const query = 'SELECT * FROM Goals WHERE id = @goalId';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('goalId', sql.Int, goalId)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }

    public async trackGoalProgress(goalId: number): Promise<{ progress_percentage: number }> {
        const query = 'SELECT progress_percentage FROM Goals WHERE id = @goalId';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('goalId', sql.Int, goalId)
            .query(query);

        return result.recordset.length ? result.recordset[0] : { progress_percentage: 0 };
    }

    public async updateGoalStatus(goalId: number, isCompleted: boolean, progressPercentage: number): Promise<Goal | null> {
        const query = `
            UPDATE Goals
            SET is_completed = @isCompleted, progress_percentage = @progressPercentage, updated_at = GETDATE()
            WHERE id = @goalId;
            SELECT * FROM Goals WHERE id = @goalId;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('goalId', sql.Int, goalId)
            .input('isCompleted', sql.Bit, isCompleted)
            .input('progressPercentage', sql.Int, progressPercentage)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }
}

export function addGoal(userId: any, goalTitle: any, goalDescription: any, goalType: any, dueDate: any) {
    throw new Error('Function not implemented.');
}

export function deleteGoal(arg0: number) {
    throw new Error('Function not implemented.');
}

export function getGoalsByUserId(arg0: number) {
    throw new Error('Function not implemented.');
}

export function getGoalsByStatus(arg0: number, arg1: boolean) {
    throw new Error('Function not implemented.');
}

export function getGoalById(arg0: number) {
    throw new Error('Function not implemented.');
}

export function trackGoalProgress(arg0: number) {
    throw new Error('Function not implemented.');
}

export function updateGoalStatus(arg0: number, isCompleted: any, progressPercentage: any) {
    throw new Error('Function not implemented.');
}
    