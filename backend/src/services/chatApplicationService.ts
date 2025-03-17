import { poolPromise } from '../db';
import * as sql from 'mssql';
import { Post } from '../interfaces/Post';
import { Comment } from '../interfaces/Comment';
import { DirectMessage } from '../interfaces/DirectMessage';

export class ChatApplicationService {
    
    // ✅ Add a New Post
    public async addPost(userId: number, content: string): Promise<Post> {
        try {
            const query = `
                EXEC AddPost @user_id, @content;
                SELECT * FROM Posts WHERE id = SCOPE_IDENTITY();
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('Failed to insert post.');
            }

            return result.recordset[0];
        } catch (error) {
            console.error('Error adding post:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Add a New Comment
    public async addComment(postId: number, userId: number, content: string): Promise<Comment> {
        try {
            const query = `
                EXEC AddComment @post_id, @user_id, @content;
                SELECT * FROM Comments WHERE id = SCOPE_IDENTITY();
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', sql.Int, postId)
                .input('user_id', sql.Int, userId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('Failed to insert comment.');
            }

            return result.recordset[0];
        } catch (error) {
            console.error('Error adding comment:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

  
    // ✅ Get All Posts
    public async getAllPosts(): Promise<Post[]> {
        try {
            const query = 'EXEC GetAllPosts;';
            const pool = await poolPromise;
            const result = await pool.request().query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Get Comments by Post ID
    public async getCommentsByPost(postId: number): Promise<Comment[]> {
        try {
            const query = 'EXEC GetCommentsByPost @post_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', sql.Int, postId)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Get Messages Between Two Users
    public async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<DirectMessage[]> {
        try {
            const query = 'EXEC GetConversationBetweenUsers @user_id_1, @user_id_2;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id_1', sql.Int, user1Id)
                .input('user_id_2', sql.Int, user2Id)
                .query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
    public async getUnreadMessages(receiverId: number): Promise<DirectMessage[]> {
        try {
            const query = `EXEC GetUnreadMessages @receiver_id;`;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('receiver_id', sql.Int, receiverId)
                .query(query);
            
            return result.recordset;
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Mark a Message as Read
    public async markMessageAsRead(messageId: number): Promise<void> {
        try {
            const query = `EXEC MarkMessageAsRead @message_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('message_id', sql.Int, messageId)
                .query(query);
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Reply to a Direct Message
    public async replyToDirectMessage(senderId: number, receiverId: number, content: string, parentMessageId: number): Promise<DirectMessage> {
        try {
            const query = `
                EXEC ReplyToDirectMessage @sender_id, @receiver_id, @content, @parent_message_id;
                SELECT * FROM DirectMessages WHERE id = SCOPE_IDENTITY();
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('parent_message_id', sql.Int, parentMessageId)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('Failed to reply to message.');
            }

            return result.recordset[0];
        } catch (error) {
            console.error('Error replying to message:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Send a Direct Message
    public async sendDirectMessage(senderId: number, receiverId: number, content: string): Promise<DirectMessage> {
        try {
            const query = `
                EXEC SendDirectMessage @sender_id, @receiver_id, @content;
            `;
    
            const pool = await poolPromise;
            const result = await pool.request()
                .input('sender_id', sql.Int, senderId)
                .input('receiver_id', sql.Int, receiverId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .query(query);
    
            console.log('Database Response:', result.recordset); // ✅ Debugging log
    
            if (!result.recordset || result.recordset.length === 0) {
                return Promise.reject(new Error('Message was sent but not retrieved.'));
            }
    
            return result.recordset[0];
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
    

    // ✅ Update a Comment
    public async updateComment(commentId: number, content: string): Promise<Comment> {
        try {
            const query = `
                EXEC UpdateComment @comment_id, @content;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('comment_id', sql.Int, commentId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('Failed to update comment.');
            }

            return result.recordset[0];
        } catch (error) {
            console.error('Error updating comment:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Update a Post
    public async updatePost(postId: number, content: string): Promise<Post> {
        try {
            const query = `
                EXEC UpdatePost @post_id, @content;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', sql.Int, postId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('Failed to update post.');
            }

            return result.recordset[0];
        } catch (error) {
            console.error('Error updating post:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
    // ✅ Delete a Post
    public async deletePost(postId: number): Promise<void> {
        try {
            const query = `EXEC DeletePost @post_id;`;
            const pool = await poolPromise;
            await pool.request().input('post_id', sql.Int, postId).query(query);
        } catch (error) {
            console.error('Error deleting post:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Delete a Comment
    public async deleteComment(commentId: number): Promise<void> {
        try {
            const query = `EXEC DeleteComment @comment_id;`;
            const pool = await poolPromise;
            await pool.request().input('comment_id', sql.Int, commentId).query(query);
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Delete Messages Between Two Users
    public async deleteMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<void> {
        try {
            const query = `EXEC DeleteMessagesBetweenUsers @user1_id, @user2_id;`;
            const pool = await poolPromise;
            await pool.request()
                .input('user1_id', sql.Int, user1Id)
                .input('user2_id', sql.Int, user2Id)
                .query(query);
        } catch (error) {
            console.error('Error deleting messages:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Delete Old Messages (Older than 36 Hours)
    public async deleteOldMessages(): Promise<void> {
        try {
            const query = `EXEC DeleteOldMessages;`;
            const pool = await poolPromise;
            await pool.request().query(query);
        } catch (error) {
            console.error('Error deleting old messages:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
}
