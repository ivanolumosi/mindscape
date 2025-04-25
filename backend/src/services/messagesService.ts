import { poolPromise } from '../db';
import * as sql from 'mssql';
import { DirectMessage } from '../interfaces/DirectMessage';
import { Group } from '../interfaces/Groups';
import { GroupMessage } from '../interfaces/Groups';
import { GroupMember } from '../interfaces/Groups';

export class MessageService {
    // =============================================
    // Direct Messaging
    // =============================================

    /**
     * Sends a direct message to another user
     */
    public async sendDirectMessage(
        senderId: number,
        receiverId: number,
        content: string,
        contentType: string = 'text',
        mediaUrl?: string,
        parentMessageId?: number
    ): Promise<{message_id: number, sent_at: Date}> {
        try {
            const query = `
                EXEC sp_SendDirectMessage @sender_id, @receiver_id, @content, 
                @content_type, @media_url, @parent_message_id;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('media_url', sql.NVarChar(255), mediaUrl)
                .input('parent_message_id', sql.Int, parentMessageId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return {
                message_id: result.recordset[0].message_id,
                sent_at: result.recordset[0].sent_at
            };
        } catch (error) {
            console.error('Error sending direct message:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Edits an existing direct message
     */
    public async editDirectMessage(
        messageId: number,
        senderId: number,
        content: string,
        contentType?: string,
        mediaUrl?: string
    ): Promise<string> {
        try {
            const query = `
                EXEC sp_EditDirectMessage @message_id, @sender_id, @content, 
                @content_type, @media_url;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('message_id', sql.Int, messageId)
                .input('sender_id', sql.Int, senderId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('media_url', sql.NVarChar(255), mediaUrl)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error editing direct message:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Marks a direct message as read
     */
    public async markMessageAsRead(
        messageId: number,
        receiverId: number
    ): Promise<string> {
        try {
            const query = 'EXEC sp_MarkMessageAsRead @message_id, @receiver_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('message_id', sql.Int, messageId)
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets chat history between two users
     */
    public async getChatHistory(
        user1Id: number,
        user2Id: number,
        limit: number = 50,
        beforeMessageId?: number
    ): Promise<DirectMessage[]> {
        try {
            const query = 'EXEC sp_GetChatHistory @user1_id, @user2_id, @limit, @before_message_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user1_id', sql.Int, user1Id)
                .input('user2_id', sql.Int, user2Id)
                .input('limit', sql.Int, limit)
                .input('before_message_id', sql.Int, beforeMessageId)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets a list of user's chats
     */
    public async getUserChatList(userId: number): Promise<any[]> {
        try {
            const query = 'EXEC sp_GetUserChatList @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching user chat list:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets count of unread messages for a user
     */
    public async getUnreadMessageCount(userId: number): Promise<{total_unread: number, unread_conversations: number}> {
        try {
            const query = 'EXEC sp_GetUnreadMessageCount @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return {
                total_unread: result.recordset[0].total_unread,
                unread_conversations: result.recordset[0].unread_conversations
            };
        } catch (error) {
            console.error('Error fetching unread message count:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // =============================================
    // Groups Management
    // =============================================

    /**
     * Creates a new group
     */
    public async createGroup(
        name: string,
        description: string,
        createdBy: number,
        initialMembers?: string // Comma-separated user IDs
    ): Promise<{group_id: number, Result: string}> {
        try {
            const query = `
                EXEC sp_CreateGroup @name, @description, @created_by, @initial_members;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('name', sql.NVarChar(100), name)
                .input('description', sql.NVarChar(255), description)
                .input('created_by', sql.Int, createdBy)
                .input('initial_members', sql.NVarChar(sql.MAX), initialMembers)
                .query(query);
                
            return {
                group_id: result.recordset[0].group_id,
                Result: result.recordset[0].Result
            };
        } catch (error) {
            console.error('Error creating group:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Deletes a group
     */
    public async deleteGroup(groupId: number, userId: number): Promise<string> {
        try {
            const query = 'EXEC sp_DeleteGroup @group_id, @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error deleting group:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Joins a group
     */
    public async joinGroup(groupId: number, userId: number): Promise<string> {
        try {
            const query = 'EXEC sp_JoinGroup @group_id, @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error joining group:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Leaves a group
     */
    public async leaveGroup(groupId: number, userId: number): Promise<string> {
        try {
            const query = 'EXEC sp_LeaveGroup @group_id, @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error leaving group:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Changes admin status of a group member
     */
    public async changeGroupAdmin(
        groupId: number,
        adminId: number,
        userId: number,
        makeAdmin: boolean
    ): Promise<string> {
        try {
            const query = 'EXEC sp_ChangeGroupAdmin @group_id, @admin_id, @user_id, @make_admin;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('admin_id', sql.Int, adminId)
                .input('user_id', sql.Int, userId)
                .input('make_admin', sql.Bit, makeAdmin ? 1 : 0)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error changing group admin status:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Sends a message to a group
     */
    public async sendGroupMessage(
        groupId: number,
        senderId: number,
        content: string,
        contentType: string = 'text',
        mediaUrl?: string
    ): Promise<{message_id: number, sent_at: Date}> {
        try {
            const query = `
                EXEC sp_SendGroupMessage @group_id, @sender_id, @content, 
                @content_type, @media_url;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('sender_id', sql.Int, senderId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('media_url', sql.NVarChar(255), mediaUrl)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return {
                message_id: result.recordset[0].message_id,
                sent_at: result.recordset[0].sent_at
            };
        } catch (error) {
            console.error('Error sending group message:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets messages from a group
     */
    public async getGroupMessages(
        groupId: number,
        userId: number,
        limit: number = 50,
        beforeMessageId?: number
    ): Promise<GroupMessage[]> {
        try {
            const query = `
                EXEC sp_GetGroupMessages @group_id, @user_id, @limit, @before_message_id;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('user_id', sql.Int, userId)
                .input('limit', sql.Int, limit)
                .input('before_message_id', sql.Int, beforeMessageId)
                .query(query);
                
            if (result.recordset[0] && result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset;
        } catch (error) {
            console.error('Error fetching group messages:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets all groups a user is a member of
     */
    public async getUserGroups(userId: number): Promise<Group[]> {
        try {
            const query = 'EXEC sp_GetUserGroups @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching user groups:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets members of a group
     */
    public async getGroupMembers(groupId: number, userId: number): Promise<GroupMember[]> {
        try {
            const query = 'EXEC sp_GetGroupMembers @group_id, @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset[0] && result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset;
        } catch (error) {
            console.error('Error fetching group members:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Sends an invite to join a group
     */
    public async sendGroupInvite(
        groupId: number,
        senderId: number,
        receiverId: number
    ): Promise<string> {
        try {
            const query = 'EXEC sp_SendGroupInvite @group_id, @sender_id, @receiver_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('group_id', sql.Int, groupId)
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error sending group invite:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
}