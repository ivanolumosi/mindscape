import { poolPromise } from '../db';
import * as sql from 'mssql';
import { User } from '../interfaces/User';
import { MentalHealthResource } from '../interfaces/MentalHealthResource';
import { UserActivityStats } from '../interfaces/UserActivityStats';

import { Message ,Session,Availability} from '../interfaces/sessions';
export class CounselorAnalyticsService {
    /**
     * Gets recommended counselors for a user
     */
    public async getRecommendedCounselors(
        userId: number,
        limit: number = 5
    ): Promise<User[]> {
        try {
            const query = 'EXEC sp_GetRecommendedCounselors @user_id, @limit;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('limit', sql.Int, limit)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching recommended counselors:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Searches users based on query and filters
     */
    public async searchUsers(
        userId: number,
        query: string,
        userType: string = 'all',
        limit: number = 10
    ): Promise<User[]> {
        try {
            const queryString = 'EXEC sp_SearchUsers @query, @user_id, @user_type, @limit;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('query', sql.NVarChar(100), query)
                .input('user_id', sql.Int, userId)
                .input('user_type', sql.NVarChar(50), userType)
                .input('limit', sql.Int, limit)
                .query(queryString);
                
            return result.recordset;
        } catch (error) {
            console.error('Error searching users:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Sends an emoji reaction to content
     */
    public async sendEmojiReaction(
        userId: number,
        contentType: string,
        contentId: number,
        emoji: string
    ): Promise<string> {
        try {
            const query = 'EXEC sp_SendEmojiReaction @user_id, @content_type, @content_id, @emoji;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('content_id', sql.Int, contentId)
                .input('emoji', sql.NVarChar(50), emoji)
                .query(query);
                
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error sending emoji reaction:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets emoji reactions for content
     */
    public async getEmojiReactions(
        contentType: string,
        contentId: number
    ): Promise<{emoji: string, count: number, user_ids: string}[]> {
        try {
            const query = 'EXEC sp_GetEmojiReactions @content_type, @content_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('content_type', sql.NVarChar(50), contentType)
                .input('content_id', sql.Int, contentId)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error getting emoji reactions:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets activity statistics for a user
     */
    public async getUserActivityStats(userId: number): Promise<UserActivityStats> {
        try {
            const query = 'EXEC sp_GetUserActivityStats @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset.length === 0) {
                throw new Error('Failed to fetch user activity statistics.');
            }
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error fetching user activity statistics:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets mental health resources
     */
    public async getMentalHealthResources(
        category?: string
    ): Promise<MentalHealthResource[]> {
        try {
            const query = 'EXEC sp_GetMentalHealthResources @category;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('category', sql.NVarChar(100), category)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching mental health resources:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Finds similar users
     */
    public async findSimilarUsers(
        userId: number,
        limit: number = 5
    ): Promise<User[]> {
        try {
            const query = 'EXEC sp_FindSimilarUsers @user_id, @limit;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('limit', sql.Int, limit)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error finding similar users:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
    public async viewSeekers(): Promise<User[]> {
        const pool = await poolPromise;
        const result = await pool.request().query('EXEC sp_Counselor_ViewSeekers;');
        return result.recordset;
    }

    public async createSeeker(name: string, email: string, password: string, faculty: string): Promise<void> {
        const pool = await poolPromise;
        await pool.request()
            .input('Name', sql.NVarChar(100), name)
            .input('Email', sql.NVarChar(100), email)
            .input('Password', sql.NVarChar(255), password)
            .input('Faculty', sql.NVarChar(100), faculty)
            .execute('sp_Counselor_CreateSeeker');
    }

    public async updateSeeker(seekerId: number, name: string, email: string, faculty: string): Promise<void> {
        const pool = await poolPromise;
        await pool.request()
            .input('SeekerID', sql.Int, seekerId)
            .input('Name', sql.NVarChar(100), name)
            .input('Email', sql.NVarChar(100), email)
            .input('Faculty', sql.NVarChar(100), faculty)
            .execute('sp_Counselor_UpdateSeeker');
    }

    public async deleteSeeker(seekerId: number): Promise<void> {
        const pool = await poolPromise;
        await pool.request()
            .input('SeekerID', sql.Int, seekerId)
            .execute('sp_Counselor_DeleteSeeker');
    }

    // ----------------------------
    // CHAT / MESSAGES
    // ----------------------------

    public async sendMessage(senderId: number, receiverId: number, content: string, parentMessageId?: number): Promise<void> {
        const pool = await poolPromise;
        await pool.request()
            .input('SenderID', sql.Int, senderId)
            .input('ReceiverID', sql.Int, receiverId)
            .input('Content', sql.NVarChar(sql.MAX), content)
            .input('ParentMessageID', sql.Int, parentMessageId ?? null)
            .execute('sp_Counselor_SendMessage');
    }

    public async viewMessages(counselorId: number, seekerId: number): Promise<Message[]> {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CounselorID', sql.Int, counselorId)
            .input('SeekerID', sql.Int, seekerId)
            .execute('sp_Counselor_ViewMessages');
        return result.recordset;
    }

    public async markMessageRead(messageId: number): Promise<void> {
        const pool = await poolPromise;
        await pool.request()
            .input('MessageID', sql.Int, messageId)
            .execute('sp_Counselor_MarkMessageRead');
    }

    // ----------------------------
    // AVAILABILITY
    // ----------------------------

    public async addOrUpdateAvailability(
        counselorId: number,
        day: string,
        startTime: string,
        endTime: string
    ): Promise<void> {
        try {
            const pool = await poolPromise;
    
            const toSqlTime = (timeStr: string): Date => {
                const [hours, minutes, seconds = '00'] = timeStr.split(':');
                const date = new Date();
                date.setHours(Number(hours), Number(minutes), Number(seconds), 0);
                return date;
            };
    
            await pool.request()
                .input('CounselorID', sql.Int, counselorId)
                .input('Day', sql.NVarChar(20), day)
                .input('StartTime', sql.Time, toSqlTime(startTime))
                .input('EndTime', sql.Time, toSqlTime(endTime))
                .execute('sp_Counselor_AddOrUpdateAvailability');
        } catch (error) {
            console.error('Error setting availability:', error);
            throw new Error(error instanceof Error ? error.message : 'Unknown error');
        }
    }
    public async checkSlotAvailability(
        counselorId: number,
        date: string,
        startTime: string,
        endTime: string
    ): Promise<void> {
        try {
            const pool = await poolPromise;
    
            const toSqlTime = (timeStr: string): Date => {
                const [hours, minutes, seconds = '00'] = timeStr.split(':');
                const date = new Date();
                date.setHours(Number(hours), Number(minutes), Number(seconds), 0);
                return date;
            };
    
            await pool.request()
                .input('CounselorID', sql.Int, counselorId)
                .input('Date', sql.Date, date)
                .input('StartTime', sql.Time, toSqlTime(startTime))
                .input('EndTime', sql.Time, toSqlTime(endTime))
                .execute('sp_Counselor_CheckSlotAvailability');
        } catch (error) {
            console.error('Error checking slot availability:', error);
            throw new Error(error instanceof Error ? error.message : 'Unknown error');
        }
    }
     
    // ----------------------------
    // SESSIONS
    // ----------------------------

    public async scheduleSession(
        counselorId: number,
        title: string,
        venue: string,
        date: string,
        startTime: string,
        endTime: string,
        description: string,
        maxParticipants: number = 1
    ): Promise<void> {
        try {
            const pool = await poolPromise;
    
            // Convert "HH:mm" or "HH:mm:ss" to valid Date object for sql.Time
            const toSqlTime = (timeStr: string): Date => {
                const [hours, minutes, seconds = '00'] = timeStr.split(':');
                const date = new Date();
                date.setHours(Number(hours), Number(minutes), Number(seconds), 0);
                return date;
            };
    
            await pool.request()
                .input('CounselorID', sql.Int, counselorId)
                .input('Title', sql.NVarChar(100), title)
                .input('Venue', sql.NVarChar(255), venue)
                .input('Date', sql.Date, date)
                .input('StartTime', sql.Time, toSqlTime(startTime))
                .input('EndTime', sql.Time, toSqlTime(endTime))
                .input('Description', sql.NVarChar(sql.MAX), description)
                .input('MaxParticipants', sql.Int, maxParticipants)
                .execute('sp_Counselor_ScheduleSession');
        } catch (error) {
            console.error('Error scheduling session:', error);
            throw new Error(error instanceof Error ? error.message : 'Unknown error');
        }
    }
    
    public async viewSessions(counselorId: number): Promise<Session[]> {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CounselorID', sql.Int, counselorId)
            .execute('sp_Counselor_ViewSessions');
        return result.recordset;
    }

    public async cancelSession(sessionId: number, counselorId: number): Promise<void> {
        const pool = await poolPromise;
        await pool.request()
            .input('SessionID', sql.Int, sessionId)
            .input('CounselorID', sql.Int, counselorId)
            .execute('sp_Counselor_CancelSession');
    }

    public async getWeeklyTimetable(counselorId: number): Promise<any[]> {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CounselorID', sql.Int, counselorId)
            .execute('sp_Counselor_WeeklyTimetable');
        return result.recordset;
    }
}