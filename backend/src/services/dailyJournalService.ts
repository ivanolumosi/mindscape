import { poolPromise } from '../db';
import * as sql from 'mssql';
import { DailyJournal } from '../interfaces/DailyJournal';

export class DailyJournalService {
    // ✅ Add a new daily journal entry
    public async addJournalEntry(userId: number, entryDate: Date, mood: string, reflections: string, gratitude: string): Promise<DailyJournal> {
        const query = `
            INSERT INTO DailyJournal (user_id, entry_date, mood, reflections, gratitude, created_at, updated_at)
            VALUES (@userId, @entryDate, @mood, @reflections, @gratitude, GETDATE(), GETDATE());
            SELECT * FROM DailyJournal WHERE id = SCOPE_IDENTITY();
        `;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('entryDate', sql.Date, entryDate)
            .input('mood', sql.NVarChar(50), mood)
            .input('reflections', sql.NVarChar(sql.MAX), reflections)
            .input('gratitude', sql.NVarChar(sql.MAX), gratitude)
            .query(query);

        return result.recordset[0];
    }

    // ✅ Delete a daily journal entry by ID
    public async deleteJournalEntry(id: number): Promise<boolean> {
        const query = 'DELETE FROM DailyJournal WHERE id = @id';
        const pool = await poolPromise;
        const result = await pool.request().input('id', sql.Int, id).query(query);
        return result.rowsAffected[0] > 0;
    }
    public async getAllJournalEntries(): Promise<DailyJournal[]> {
        const query = 'EXEC GetAllDailyJournalEntries';
        const pool = await poolPromise;
        const result = await pool.request().query(query);
        return result.recordset;
    }
    

    // ✅ Get daily journal entry by ID
    public async getJournalEntryById(id: number): Promise<DailyJournal | null> {
        const query = 'EXEC GetDailyJournalEntryById @id';
        const pool = await poolPromise;
        const result = await pool.request().input('id', sql.Int, id).query(query);
        return result.recordset.length ? result.recordset[0] : null;
    }

    // ✅ Get all journal entries for a user
    public async getJournalEntriesByUser(userId: number): Promise<DailyJournal[]> {
        const query = 'EXEC GetDailyJournalEntriesByUser @UserId';
        const pool = await poolPromise;
        const result = await pool.request().input('UserId', sql.Int, userId).query(query);
        return result.recordset;
    }

    // ✅ Get journal entries within a date range
    public async getJournalEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<DailyJournal[]> {
        const query = 'EXEC GetDailyJournalEntriesByDateRange @user_id, @start_date, @end_date';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('start_date', sql.Date, startDate)
            .input('end_date', sql.Date, endDate)
            .query(query);
        return result.recordset;
    }

    // ✅ Get journal statistics for a user
    public async getJournalStatistics(userId: number): Promise<{ TotalEntries: number; FirstEntryDate: Date | null; LastEntryDate: Date | null }> {
        const query = 'EXEC GetJournalStatistics @user_id';
        const pool = await poolPromise;
        const result = await pool.request().input('user_id', sql.Int, userId).query(query);
        return result.recordset.length ? result.recordset[0] : { TotalEntries: 0, FirstEntryDate: null, LastEntryDate: null };
    }

    // ✅ Update a daily journal entry
    public async updateJournalEntry(id: number, mood: string, reflections: string, gratitude: string): Promise<DailyJournal | null> {
        const query = `
            UPDATE DailyJournal
            SET mood = @mood, reflections = @reflections, gratitude = @gratitude, updated_at = GETDATE()
            WHERE id = @id;
            SELECT * FROM DailyJournal WHERE id = @id;
        `;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('mood', sql.NVarChar(50), mood)
            .input('reflections', sql.NVarChar(sql.MAX), reflections)
            .input('gratitude', sql.NVarChar(sql.MAX), gratitude)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }
}
