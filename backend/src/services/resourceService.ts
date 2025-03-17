import { poolPromise } from '../db';
import * as sql from 'mssql';
import { Resource } from '../interfaces/Resource';

export class ResourceService {
    public async addResource(
        title: string,
        description: string,
        type: string,
        url: string,
        author: string,
        datePublished: Date,
        duration: number | null,
        eventDate: Date | null
    ): Promise<Resource> {
        const query = `
            INSERT INTO Resources (title, description, type, url, author, date_published, duration, event_date, created_at, updated_at)
            VALUES (@title, @description, @type, @url, @author, @datePublished, @duration, @eventDate, GETDATE(), GETDATE());
            SELECT * FROM Resources WHERE id = SCOPE_IDENTITY();
        `;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.NVarChar(255), title)
            .input('description', sql.NVarChar(sql.MAX), description)
            .input('type', sql.NVarChar(50), type)
            .input('url', sql.NVarChar(255), url)
            .input('author', sql.NVarChar(255), author)
            .input('datePublished', sql.DateTime, datePublished)
            .input('duration', sql.Int, duration)
            .input('eventDate', sql.DateTime, eventDate)
            .query(query);

        return result.recordset[0];
    }

    public async deleteResource(id: number): Promise<boolean> {
        const query = 'DELETE FROM Resources WHERE id = @id';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        return result.rowsAffected[0] > 0;
    }

    public async getAllResources(): Promise<Resource[]> {
        const query = 'SELECT * FROM Resources ORDER BY created_at DESC';
        const pool = await poolPromise;
        const result = await pool.request().query(query);

        return result.recordset;
    }

    public async getRecentlyAddedResources(limit: number): Promise<Resource[]> {
        const query = 'SELECT TOP (@limit) * FROM Resources ORDER BY created_at DESC';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('limit', sql.Int, limit)
            .query(query);

        return result.recordset;
    }

    public async getResourceById(id: number): Promise<Resource | null> {
        const query = 'SELECT * FROM Resources WHERE id = @id';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }

    public async getResourcesByAuthor(author: string): Promise<Resource[]> {
        const query = 'SELECT * FROM Resources WHERE author = @author ORDER BY date_published DESC';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('author', sql.NVarChar(255), author)
            .query(query);

        return result.recordset;
    }

    public async getResourcesByType(type: string): Promise<Resource[]> {
        const query = 'SELECT * FROM Resources WHERE type = @type ORDER BY created_at DESC';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('type', sql.NVarChar(50), type)
            .query(query);

        return result.recordset;
    }

    public async updateResource(
        id: number,
        title: string,
        description: string,
        type: string,
        url: string,
        author: string,
        datePublished: Date,
        duration: number | null,
        eventDate: Date | null
    ): Promise<Resource | null> {
        const query = `
            UPDATE Resources
            SET title = @title, description = @description, type = @type, url = @url, 
                author = @author, date_published = @datePublished, 
                duration = @duration, event_date = @eventDate, updated_at = GETDATE()
            WHERE id = @id;
            SELECT * FROM Resources WHERE id = @id;
        `;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar(255), title)
            .input('description', sql.NVarChar(sql.MAX), description)
            .input('type', sql.NVarChar(50), type)
            .input('url', sql.NVarChar(255), url)
            .input('author', sql.NVarChar(255), author)
            .input('datePublished', sql.DateTime, datePublished)
            .input('duration', sql.Int, duration)
            .input('eventDate', sql.DateTime, eventDate)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }
  
}
