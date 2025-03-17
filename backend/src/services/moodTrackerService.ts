import { poolPromise } from '../db';
import * as sql from 'mssql';
import { MoodTracker } from '../interfaces/MoodTracker';

export class MoodTrackerService {
    // ✅ Add a new mood entry
    public async addMoodEntry(userId: number, mood: string, notes?: string): Promise<MoodTracker> {
        const query = `
            INSERT INTO MoodTracker (user_id, mood, notes, recorded_at)
            VALUES (@userId, @mood, @notes, GETDATE());
            SELECT * FROM MoodTracker WHERE id = SCOPE_IDENTITY();
        `;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('mood', sql.NVarChar(50), mood)
            .input('notes', sql.NVarChar(500), notes || null)
            .query(query);

        return result.recordset[0];
    }

    // ✅ Delete a mood entry by ID
    public async deleteMoodEntry(id: number): Promise<boolean> {
        const query = 'DELETE FROM MoodTracker WHERE id = @id';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        return result.rowsAffected[0] > 0;
    }

    // ✅ Get all mood entries for a specific user
    public async getMoodByUserId(userId: number): Promise<MoodTracker[]> {
        const query = 'EXEC GetMoodByUserId @user_id';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(query);

        return result.recordset;
    }

    // ✅ Get all mood entries for all users
    public async getAllUserMoods(): Promise<MoodTracker[]> {
        const query = 'EXEC GetAllUserMoods';
        const pool = await poolPromise;
        const result = await pool.request().query(query);

        return result.recordset;
    }

    // ✅ Get mood entries by date range
    public async getMoodEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<MoodTracker[]> {
        const query = `
            SELECT id, mood, notes, recorded_at 
            FROM MoodTracker 
            WHERE user_id = @userId 
              AND recorded_at BETWEEN @startDate AND @endDate
            ORDER BY recorded_at DESC;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('startDate', sql.DateTime, startDate)
            .input('endDate', sql.DateTime, endDate)
            .query(query);

        return result.recordset;
    }

    // ✅ Get mood statistics for a user (counts occurrences of each mood)
    public async getMoodStatistics(userId: number): Promise<{ mood: string; mood_count: number }[]> {
        const query = `
            SELECT mood, COUNT(*) AS mood_count 
            FROM MoodTracker 
            WHERE user_id = @userId 
            GROUP BY mood 
            ORDER BY mood_count DESC;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);

        return result.recordset;
    }

    // ✅ Update a mood entry by ID
    public async updateMoodEntry(id: number, mood: string, notes?: string): Promise<MoodTracker | null> {
        const query = `
            UPDATE MoodTracker 
            SET mood = @mood, notes = @notes, recorded_at = GETDATE() 
            WHERE id = @id;
            SELECT * FROM MoodTracker WHERE id = @id;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('mood', sql.NVarChar(50), mood)
            .input('notes', sql.NVarChar(500), notes || null)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }
}
