import { poolPromise } from '../db';
import * as sql from 'mssql';
import { User } from '../interfaces/User';
import { FriendRequest } from '../interfaces/FriendRequest';
import { Friend } from '../interfaces/Friend';

export class UserProfileService {
    
    // Create or Update User Profile
    public async createUpdateUserProfile(
        name: string, 
        email: string, 
        password: string, 
        role: string,
        profileImage?: string,
        specialization?: string,
        faculty?: string,
        privileges?: string,
        availabilitySchedule?: string,
        nickname?: string,
        id?: number
    ): Promise<number> {
        try {
            const query = `
                EXEC sp_CreateUpdateUserProfile @id, @name, @email, @password, @role, 
                @profile_image, @specialization, @faculty, @privileges, @availability_schedule, @nickname;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar(100), name)
                .input('email', sql.NVarChar(100), email)
                .input('password', sql.NVarChar(255), password)
                .input('role', sql.NVarChar(50), role)
                .input('profile_image', sql.NVarChar(255), profileImage)
                .input('specialization', sql.NVarChar(100), specialization)
                .input('faculty', sql.NVarChar(100), faculty)
                .input('privileges', sql.NVarChar(255), privileges)
                .input('availability_schedule', sql.NVarChar(sql.MAX), availabilitySchedule)
                .input('nickname', sql.NVarChar(50), nickname)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('Failed to create or update user profile.');
            }

            return result.recordset[0].UserID;
        } catch (error) {
            console.error('Error creating/updating user profile:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Get User Profile
    public async getUserProfile(userId: number): Promise<User> {
        try {
            const query = 'EXEC sp_GetUserProfile @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset.length === 0) {
                throw new Error('User not found.');
            }
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Delete User
    public async deleteUser(userId: number): Promise<string> {
        try {
            const query = 'EXEC sp_DeleteUser @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
  // Auto-add counselors as friends and return updated counselor friends list
public async autoAddCounselorsToFriends(userId: number): Promise<Friend[]> {
    try {
        const pool = await poolPromise;

        // 1️⃣ Call the stored procedure to add friendships
        await pool.request()
            .input('NewUserId', sql.Int, userId)
            .execute('AutoAddCounselorFriends');

        // 2️⃣ Get the updated friend list
        const friendListResult = await pool.request()
            .input('user_id', sql.Int, userId)
            .query('EXEC sp_GetFriendList @user_id');

        const allFriends: Friend[] = friendListResult.recordset;

        // 3️⃣ Filter only counselors
        const counselorFriends = allFriends.filter(friend => friend.role === 'counselor');

        return counselorFriends;
    } catch (error) {
        console.error('Error auto-adding counselor friends:', error);
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
}

    // Send Friend Request
    public async sendFriendRequest(senderId: number, receiverId: number): Promise<string> {
        try {
            const query = 'EXEC sp_SendFriendRequest @sender_id, @receiver_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Respond to Friend Request
    public async respondToFriendRequest(requestId: number, response: string): Promise<string> {
        try {
            const query = 'EXEC sp_RespondToFriendRequest @request_id, @response;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('request_id', sql.Int, requestId)
                .input('response', sql.NVarChar(50), response)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error responding to friend request:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Cancel Friend Request
    public async cancelFriendRequest(requestId: number): Promise<string> {
        try {
            const query = 'EXEC sp_CancelFriendRequest @request_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('request_id', sql.Int, requestId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Remove Friend
    public async removeFriend(userId: number, friendId: number): Promise<string> {
        try {
            const query = 'EXEC sp_RemoveFriend @user_id, @friend_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('friend_id', sql.Int, friendId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error removing friend:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Get Friend List
    public async getFriendList(userId: number): Promise<Friend[]> {
        try {
            const query = 'EXEC sp_GetFriendList @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching friend list:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Get Pending Friend Requests
    public async getPendingFriendRequests(userId: number, requestType: string = 'all'): Promise<FriendRequest[]> {
        try {
            const query = 'EXEC sp_GetPendingFriendRequests @user_id, @request_type;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('request_type', sql.NVarChar(10), requestType)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching pending friend requests:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // Get Recommended Friends
    public async getRecommendedFriends(userId: number, recommendationType: string = 'all', limit: number = 10): Promise<Friend[]> {
        try {
            const query = 'EXEC sp_GetRecommendedFriends @user_id, @recommendation_type, @limit;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('recommendation_type', sql.NVarChar(50), recommendationType)
                .input('limit', sql.Int, limit)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching recommended friends:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
}