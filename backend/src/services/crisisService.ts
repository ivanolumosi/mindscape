import { poolPromise } from '../db';
import * as sql from 'mssql';
import { Crisis } from '../interfaces/Crisis';
import { CrisisCall } from '../interfaces/CrisisCall';
import { CrisisChat } from '../interfaces/CrisisChat';
import { EventEmitter } from 'events';

class CrisisService {
    private crisisEvents: EventEmitter;

    constructor() {
        this.crisisEvents = new EventEmitter();
    }

    // ✅ Real-time event emitter
    public on(event: string, listener: (...args: any[]) => void): void {
        this.crisisEvents.on(event, listener);
    }

    // ✅ Create a Crisis Report
    public async createCrisisReport(seekerId: number, crisisType: string, description: string, priority: number = 1): Promise<number> {
        try {
            const query = `
                EXEC CreateCrisisReport @seeker_id, @crisis_type, @description, @priority;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('seeker_id', sql.Int, seekerId)
                .input('crisis_type', sql.NVarChar(100), crisisType)
                .input('description', sql.NVarChar(sql.MAX), description)
                .input('priority', sql.Int, priority)
                .query(query);

            const newCrisisId = result.recordset[0].NewCrisisID;

            // Emit real-time event for a new crisis
            this.crisisEvents.emit('newCrisis', newCrisisId);

            return newCrisisId;
        } catch (error) {
            console.error('Error creating crisis report:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Assign a Counselor to a Crisis
    public async assignCounselor(crisisId: number, counselorId: number): Promise<Crisis> {
        try {
            const query = `EXEC AssignCounselorToCrisis @crisis_id, @counselor_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('crisis_id', sql.Int, crisisId)
                .input('counselor_id', sql.Int, counselorId)
                .query(query);

            const updatedCrisis = result.recordset[0];

            // Emit event that a crisis is assigned
            this.crisisEvents.emit('crisisAssigned', updatedCrisis);

            return updatedCrisis;
        } catch (error) {
            console.error('Error assigning counselor:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Update Crisis Status (Pending, In Progress, Resolved)
    public async updateCrisisStatus(crisisId: number, status: string, resolvedAt: Date | null = null): Promise<Crisis> {
        try {
            const query = `EXEC UpdateCrisisStatus @crisis_id, @status, @resolved_at;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('crisis_id', sql.Int, crisisId)
                .input('status', sql.NVarChar(50), status)
                .input('resolved_at', sql.DateTime, resolvedAt)
                .query(query);

            const updatedCrisis = result.recordset[0];

            // Emit event when crisis status updates
            this.crisisEvents.emit('crisisUpdated', updatedCrisis);

            return updatedCrisis;
        } catch (error) {
            console.error('Error updating crisis status:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Log a Crisis Call
    public async logCrisisCall(crisisId: number, callerId: number, callStart: Date, callType: string): Promise<number> {
        try {
            const query = `EXEC LogCrisisCall @crisis_id, @caller_id, @call_start, @call_type;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('crisis_id', sql.Int, crisisId)
                .input('caller_id', sql.Int, callerId)
                .input('call_start', sql.DateTime, callStart)
                .input('call_type', sql.NVarChar(50), callType)
                .query(query);

            const newCallId = result.recordset[0].NewCallID;

            // Emit event for a new crisis call
            this.crisisEvents.emit('crisisCallLogged', newCallId);

            return newCallId;
        } catch (error) {
            console.error('Error logging crisis call:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Log a Crisis Chat Message
    public async logCrisisChatMessage(crisisId: number, senderId: number, message: string): Promise<number> {
        try {
            const query = `EXEC LogCrisisChatMessage @crisis_id, @sender_id, @message;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('crisis_id', sql.Int, crisisId)
                .input('sender_id', sql.Int, senderId)
                .input('message', sql.NVarChar(sql.MAX), message)
                .query(query);

            const newMessageId = result.recordset[0].NewMessageID;

            // Emit event when a new message is logged
            this.crisisEvents.emit('crisisMessageLogged', newMessageId);

            return newMessageId;
        } catch (error) {
            console.error('Error logging crisis message:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Delete a Crisis
    public async deleteCrisis(crisisId: number): Promise<void> {
        try {
            const query = `EXEC DeleteCrisis @CrisisId;`;
            const pool = await poolPromise;
            await pool.request()
                .input('CrisisId', sql.Int, crisisId)
                .query(query);

            // Emit event for crisis deletion
            this.crisisEvents.emit('crisisDeleted', crisisId);
        } catch (error) {
            console.error('Error deleting crisis:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Delete a Crisis Call
    public async deleteCrisisCall(callId: number): Promise<void> {
        try {
            const query = `EXEC DeleteCrisisCall @call_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('call_id', sql.Int, callId)
                .query(query);
        } catch (error) {
            console.error('Error deleting crisis call:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Delete a Crisis Chat Message
    public async deleteCrisisChatMessage(messageId: number): Promise<void> {
        try {
            const query = `EXEC DeleteCrisisChatMessage @MessageId;`;
            const pool = await poolPromise;
            await pool.request()
                .input('MessageId', sql.Int, messageId)
                .query(query);
        } catch (error) {
            console.error('Error deleting crisis chat message:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
     
    // ✅ Change Crisis Status
    public async changeCrisisStatus(crisisId: number, status: string, resolvedAt: Date | null = null): Promise<Crisis> {
        try {
            const query = `EXEC ChangeCrisisStatus @crisis_id, @status, @resolved_at;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('crisis_id', sql.Int, crisisId)
                .input('status', sql.NVarChar(50), status)
                .input('resolved_at', sql.DateTime, resolvedAt)
                .query(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error updating crisis status:', error);
            throw new Error('Failed to update crisis status');
        }
    }

    // ✅ Get All Crisis Calls for a User
    public async getAllCrisisCallsForUser(userId: number): Promise<CrisisCall[]> {
        try {
            const query = `EXEC GetAllCrisisCallsForUser @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching crisis calls for user:', error);
            throw new Error('Failed to fetch crisis calls');
        }
    }

    // ✅ Get All Crisis Chats by a User
    public async getAllCrisisChatsByUser(userId: number): Promise<CrisisChat[]> {
        try {
            const query = `EXEC GetAllCrisisChatsByUser @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching crisis chats for user:', error);
            throw new Error('Failed to fetch crisis chats');
        }
    }

    // ✅ Get All Crisis Calls
    public async getAllCrisisCalls(): Promise<CrisisCall[]> {
        try {
            const query = `EXEC GetAllCrisisCalls;`;
            const pool = await poolPromise;
            const result = await pool.request().query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching crisis calls:', error);
            throw new Error('Failed to fetch crisis calls');
        }
    }

    // ✅ Get All Crisis Chats
    public async getAllCrisisChats(): Promise<CrisisChat[]> {
        try {
            const query = `EXEC GetAllCrisisChats;`;
            const pool = await poolPromise;
            const result = await pool.request().query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching crisis chats:', error);
            throw new Error('Failed to fetch crisis chats');
        }
    }
}

export default new CrisisService();
