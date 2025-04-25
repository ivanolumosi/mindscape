import { poolPromise } from '../db';
import * as sql from 'mssql';
import { Post } from '../interfaces/Post';
import { Comment } from '../interfaces/Comment';

export class PostService {
    /**
     * Creates a new post
     */
    public async createPost(
        userId: number,
        content: string,
        contentType: string = 'text',
        mediaUrl?: string
    ): Promise<{post_id: number, Result: string}> {
        try {
            const query = `
                EXEC sp_CreatePost @user_id, @content, @content_type, @media_url;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('media_url', sql.NVarChar(255), mediaUrl)
                .query(query);
                
            return {
                post_id: result.recordset[0].post_id,
                Result: result.recordset[0].Result
            };
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Updates an existing post
     */
    public async updatePost(
        postId: number,
        userId: number,
        content: string,
        contentType?: string,
        mediaUrl?: string
    ): Promise<string> {
        try {
            const query = `
                EXEC sp_UpdatePost @post_id, @user_id, @content, @content_type, @media_url;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', sql.Int, postId)
                .input('user_id', sql.Int, userId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('media_url', sql.NVarChar(255), mediaUrl)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error updating post:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Deletes a post
     */
    public async deletePost(
        postId: number,
        userId: number
    ): Promise<string> {
        try {
            const query = 'EXEC sp_DeletePost @post_id, @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', sql.Int, postId)
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error deleting post:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Adds a comment to a post
     */
    public async addComment(
        postId: number,
        userId: number,
        content: string,
        contentType: string = 'text',
        mediaUrl?: string
    ): Promise<{comment_id: number, Result: string}> {
        try {
            const query = `
                EXEC sp_AddComment @post_id, @user_id, @content, @content_type, @media_url;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', sql.Int, postId)
                .input('user_id', sql.Int, userId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('media_url', sql.NVarChar(255), mediaUrl)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return {
                comment_id: result.recordset[0].comment_id,
                Result: result.recordset[0].Result
            };
        } catch (error) {
            console.error('Error adding comment:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Updates an existing comment
     */
    public async updateComment(
        commentId: number,
        userId: number,
        content: string,
        contentType?: string,
        mediaUrl?: string
    ): Promise<string> {
        try {
            const query = `
                EXEC sp_UpdateComment @comment_id, @user_id, @content, @content_type, @media_url;
            `;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('comment_id', sql.Int, commentId)
                .input('user_id', sql.Int, userId)
                .input('content', sql.NVarChar(sql.MAX), content)
                .input('content_type', sql.NVarChar(50), contentType)
                .input('media_url', sql.NVarChar(255), mediaUrl)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error updating comment:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Deletes a comment
     */
    public async deleteComment(
        commentId: number,
        userId: number
    ): Promise<string> {
        try {
            const query = 'EXEC sp_DeleteComment @comment_id, @user_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('comment_id', sql.Int, commentId)
                .input('user_id', sql.Int, userId)
                .query(query);
                
            if (result.recordset[0].ErrorMessage) {
                throw new Error(result.recordset[0].ErrorMessage);
            }
            
            return result.recordset[0].Result;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets a post with its comments
     */
    public async getPostWithComments(postId: number): Promise<{ post: Post; comments: Comment[] }> {
        try {
            const query = 'EXEC sp_GetPostWithComments @post_id;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', sql.Int, postId)
                .query(query);
    
            const recordsets = result.recordsets as sql.IRecordSet<any>[];
    
            if (recordsets.length < 2) {
                throw new Error('Failed to fetch post with comments.');
            }
    
            return {
                post: recordsets[0][0] as Post,
                comments: recordsets[1] as Comment[],
            };
        } catch (error) {
            console.error('Error fetching post with comments:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
    

    /**
     * Gets user timeline posts
     */
    public async getUserTimeline(
        userId: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<Post[]> {
        try {
            const query = 'EXEC sp_GetUserTimeline @user_id, @page, @page_size;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('page', sql.Int, page)
                .input('page_size', sql.Int, pageSize)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching user timeline:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    /**
     * Gets feed of posts from friends and counselors
     */
    public async getFeed(
        userId: number,
        page: number = 1,
        pageSize: number = 10,
        includeCounselors: boolean = true
    ): Promise<Post[]> {
        try {
            const query = 'EXEC sp_GetFeed @user_id, @page, @page_size, @include_counselors;';
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('page', sql.Int, page)
                .input('page_size', sql.Int, pageSize)
                .input('include_counselors', sql.Bit, includeCounselors ? 1 : 0)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error fetching feed:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
}