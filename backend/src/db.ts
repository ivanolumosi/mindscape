import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Database configuration
const dbConfig: sql.config = {
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    server: process.env.DB_SERVER as string,
    database: process.env.DB_DATABASE as string,
    pool: {
        max: 10,  // Max concurrent connections
        min: 0,   // Min connections to keep open
        idleTimeoutMillis: 30000 // 30 sec timeout for idle connections
    },
    options: {
        encrypt: false, // Set to true for Azure
        trustServerCertificate: true, // Required for local development
    },
};

let pool: sql.ConnectionPool | null = null;

// Function to get the database pool (singleton pattern)
export async function getDbPool(): Promise<sql.ConnectionPool> {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
            console.log('✅ Database connected successfully');
        }
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

// Exporting the poolPromise to be used in queries
export const poolPromise = getDbPool();

// Export sql for running raw queries if needed
export { sql };