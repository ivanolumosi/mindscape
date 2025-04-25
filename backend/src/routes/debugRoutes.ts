import express from 'express';
import { poolPromise } from '../db';

const router = express.Router();

router.get('/db-info', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                DB_NAME() AS currentDatabase, 
                @@SERVERNAME AS serverName;
        `);

        res.json({
            connectedDatabase: result.recordset[0].currentDatabase,
            connectedServer: result.recordset[0].serverName,
        });
    } catch (error: unknown) {
        const err = error as Error; // 👈 Cast to Error
        console.error('❌ Error fetching DB info:', err);
        res.status(500).json({ error: 'Failed to fetch DB info', details: err.message });
    }
    
});

export default router;
