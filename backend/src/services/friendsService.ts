import { poolPromise } from '../db';
import * as sql from 'mssql';
import { Friend } from '../interfaces/Friend';
import { FriendRequest } from '../interfaces/FriendRequest';

class FriendsService {
    
    // ✅ Send a Friend Request
    public async sendFriendRequest(senderId: number, receiverId: number): Promise<void> {
        try {
            const query = `EXEC SendFriendRequest @sender_id, @receiver_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw new Error('Failed to send friend request');
        }
    }

    // ✅ Accept a Friend Request
    public async acceptFriendRequest(requestId: number): Promise<void> {
        try {
            const query = `EXEC AcceptFriendRequest @request_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('request_id', sql.Int, requestId)
                .query(query);
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw new Error('Failed to accept friend request');
        }
    }

    // ✅ Reject a Friend Request
    public async rejectFriendRequest(requestId: number): Promise<void> {
        try {
            const query = `EXEC RejectFriendRequest @request_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('request_id', sql.Int, requestId)
                .query(query);
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            throw new Error('Failed to reject friend request');
        }
    }

    // ✅ Remove a Friend
    public async removeFriend(userId: number, friendId: number): Promise<void> {
        try {
            const query = `EXEC RemoveFriend @user_id, @friend_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('user_id', sql.Int, userId)
                .input('friend_id', sql.Int, friendId)
                .query(query);
        } catch (error) {
            console.error('Error removing friend:', error);
            throw new Error('Failed to remove friend');
        }
    }

    // ✅ Get Friend List
    public async getFriendList(userId: number): Promise<Friend[]> {
        try {
            const query = `EXEC GetFriendList @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching friend list:', error);
            throw new Error('Failed to fetch friend list');
        }
    }

    // ✅ Get Incoming Friend Requests
    public async getIncomingFriendRequests(userId: number): Promise<FriendRequest[]> {
        try {
            const query = `EXEC GetIncomingFriendRequests @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching incoming friend requests:', error);
            throw new Error('Failed to fetch friend requests');
        }
    }
}

export default new FriendsService();
