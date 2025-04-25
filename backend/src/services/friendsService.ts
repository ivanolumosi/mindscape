import { poolPromise } from '../db';
import * as sql from 'mssql';
import { Friend } from '../interfaces/Friend';
import { FriendRequest } from '../interfaces/FriendRequest';

class FriendsService {
    public async sendFriendRequest(senderId: number, receiverId: number): Promise<FriendRequest> {
        try {
            // Check if sender and receiver are the same
            if (senderId === receiverId) {
                throw new Error('Cannot send friend request to yourself');
            }

            const query = `EXEC SendFriendRequest @sender_id, @receiver_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
    
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0] as FriendRequest;
            } else {
                throw new Error('Friend request could not be created');
            }
        } catch (error: any) {
            console.error('Error sending friend request:', error);
            
            // Handle SQL specific errors
            if (error.message && error.message.includes('Friend request already exists')) {
                throw new Error('Friend request already exists between these users');
            }
            
            // Check if it's a user not found error (might be thrown by SQL constraints)
            if (error.number === 547) { // Foreign key constraint error
                throw new Error('One or both users do not exist');
            }
            
            throw new Error(`Failed to send friend request: ${error.message}`);
        }
    }
    
    public async acceptFriendRequest(requestId: number): Promise<FriendRequest> {
        try {
            const query = `EXEC AcceptFriendRequest @request_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('request_id', sql.Int, requestId)
                .query(query);
    
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0] as FriendRequest;
            } else {
                throw new Error('Friend request not found or already processed');
            }
        } catch (error: any) {
            console.error('Error accepting friend request:', error);
            
            // Check if request doesn't exist
            if (error.number === 50000 && error.message.includes('not found')) {
                throw new Error('Friend request not found');
            }
            
            // Check if request is already accepted
            if (error.number === 50000 && error.message.includes('already accepted')) {
                throw new Error('Friend request has already been accepted');
            }
            
            throw new Error(`Failed to accept friend request: ${error.message}`);
        }
    }
    
    public async rejectFriendRequest(requestId: number): Promise<void> {
        try {
            const query = `EXEC RejectFriendRequest @request_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('request_id', sql.Int, requestId)
                .query(query);
                
            // Check if any rows were affected
            if (result.rowsAffected && result.rowsAffected[0] === 0) {
                throw new Error('Friend request not found');
            }
        } catch (error: any) {
            console.error('Error rejecting friend request:', error);
            
            // Check for specific SQL error messages
            if (error.number === 50000) {
                if (error.message.includes('not found')) {
                    throw new Error('Friend request not found');
                }
                if (error.message.includes('already rejected')) {
                    throw new Error('Friend request has already been rejected');
                }
            }
            
            throw new Error(`Failed to reject friend request: ${error.message}`);
        }
    }

    public async removeFriend(userId: number, friendId: number): Promise<void> {
        try {
            // Validate that userId and friendId are different
            if (userId === friendId) {
                throw new Error('Cannot remove yourself as a friend');
            }
            
            const query = `EXEC RemoveFriend @user_id, @friend_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('friend_id', sql.Int, friendId)
                .query(query);
                
            // Check if any rows were affected
            if (result.rowsAffected && result.rowsAffected[0] === 0) {
                throw new Error('Friendship not found');
            }
        } catch (error: any) {
            console.error('Error removing friend:', error);
            
            // Handle specific SQL errors
            if (error.number === 50000 && error.message.includes('not friends')) {
                throw new Error('These users are not friends');
            }
            
            throw new Error(`Failed to remove friend: ${error.message}`);
        }
    }

    public async getFriendList(userId: number): Promise<Friend[]> {
        try {
            const query = `EXEC GetFriendList @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return result.recordset as Friend[];
        } catch (error: any) {
            console.error('Error fetching friend list:', error);
            
            // Check for user not found
            if (error.number === 50000 && error.message.includes('User not found')) {
                throw new Error('User not found');
            }
            
            throw new Error(`Failed to fetch friend list: ${error.message}`);
        }
    }

    public async getIncomingFriendRequests(userId: number): Promise<FriendRequest[]> {
        try {
            const query = `EXEC GetIncomingFriendRequests @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return result.recordset as FriendRequest[];
        } catch (error: any) {
            console.error('Error fetching incoming friend requests:', error);
            
            // Check for user not found
            if (error.number === 50000 && error.message.includes('User not found')) {
                throw new Error('User not found');
            }
            
            throw new Error(`Failed to fetch friend requests: ${error.message}`);
        }
    }
    
    // New method to get outgoing friend requests
    public async getOutgoingFriendRequests(userId: number): Promise<FriendRequest[]> {
        try {
            const query = `EXEC GetOutgoingFriendRequests @user_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return result.recordset as FriendRequest[];
        } catch (error: any) {
            console.error('Error fetching outgoing friend requests:', error);
            
            // Check for user not found
            if (error.number === 50000 && error.message.includes('User not found')) {
                throw new Error('User not found');
            }
            
            throw new Error(`Failed to fetch outgoing friend requests: ${error.message}`);
        }
    }
    
    // Check if two users are friends
    public async checkFriendship(userId: number, friendId: number): Promise<boolean> {
        try {
            const query = `
                SELECT COUNT(*) as friendCount 
                FROM Friends 
                WHERE user_id = @user_id AND friend_id = @friend_id
            `;
            
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('friend_id', sql.Int, friendId)
                .query(query);
                
            return result.recordset[0].friendCount > 0;
        } catch (error: any) {
            console.error('Error checking friendship status:', error);
            throw new Error(`Failed to check friendship status: ${error.message}`);
        }
    }
}

export default new FriendsService();