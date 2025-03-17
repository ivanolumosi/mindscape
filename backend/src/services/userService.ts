import { poolPromise, sql } from '../db';
import { Seeker } from '../interfaces/Seeker';
import { Admin } from '../interfaces/Admin';
import { Counselor } from '../interfaces/Counselor';
import bcrypt from 'bcrypt';

export type User = Seeker | Admin | Counselor;

export class UserService {
    // ✅ Register a New User (No Email)
    public async registerUser(
        name: string,
        email: string,
        password: string,
        role: 'seeker' | 'admin' | 'counselor',
        faculty?: string,
        profileImage?: string,
        specialization?: string,
        privileges?: string,
        availabilitySchedule?: string
    ): Promise<User | null> {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const pool = await poolPromise;

            const result = await pool.request()
                .input('name', sql.NVarChar(100), name)
                .input('email', sql.NVarChar(100), email)
                .input('password', sql.NVarChar(255), hashedPassword)
                .input('role', sql.NVarChar(50), role)
                .input('profileImage', sql.NVarChar(255), profileImage ?? null)
                .input('specialization', sql.NVarChar(100), specialization ?? null)
                .input('faculty', sql.NVarChar(100), faculty ?? null)
                .input('privileges', sql.NVarChar(255), privileges ?? null)
                .input('availabilitySchedule', sql.NVarChar(sql.MAX), availabilitySchedule ?? null)
                .execute('RegisterUser');

            return result.recordset.length ? result.recordset[0] : null;
        } catch (error) {
            console.error('Error registering user:', error);
            throw new Error('Failed to register user');
        }
    }

    // ✅ User Login
    public async loginUser(email: string, password: string): Promise<User | null> {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('email', sql.NVarChar(100), email)
                .execute('GetUserByEmail');

            if (result.recordset.length === 0) return null;

            const user = result.recordset[0];
            const isValidPassword = await bcrypt.compare(password, user.password);
            return isValidPassword ? user : null;
        } catch (error) {
            console.error('Error logging in user:', error);
            throw new Error('Failed to log in user');
        }
    }


    // ✅ Get All Users
    public async getAllUsers(): Promise<User[]> {
        try {
            const pool = await poolPromise;
            const result = await pool.request().execute('GetAllUsers');
            return result.recordset;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw new Error('Failed to get users');
        }
    }

    // ✅ Get User by ID
    public async getUserById(userId: number): Promise<User | null> {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, userId)
                .execute('GetUserById');

            if (result.recordset.length === 0) {
                return null;  
            }

            return result.recordset[0] as User; 
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            throw new Error('Failed to get user');
        }
    }

    // ✅ Get Users by Role
    public async getUsersByRole(role: string): Promise<User[]> {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('role', sql.NVarChar(50), role)
                .execute('GetUsersByRole');

            return result.recordset;
        } catch (error) {
            console.error(`Error fetching users by role ${role}:`, error);
            throw new Error('Failed to get users by role');
        }
    }

    // ✅ Get Seekers by Faculty
    public async getUsersByFaculty(faculty: string): Promise<Seeker[]> {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('faculty', sql.NVarChar(100), faculty)
                .execute('GetUsersByFaculty');

            return result.recordset;
        } catch (error) {
            console.error(`Error fetching seekers by faculty ${faculty}:`, error);
            throw new Error('Failed to get users by faculty');
        }
    }

    // ✅ Update User
    public async updateUser(id: number, user: Partial<User>): Promise<void> {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar(100), user.name ?? null)
                .input('email', sql.NVarChar(100), user.email ?? null)
                .execute('UpdateUser');
        } catch (error) {
            console.error(`Error updating user with ID ${id}:`, error);
            throw new Error('Failed to update user');
        }
    }

    // ✅ Delete User
    public async deleteUser(id: number): Promise<void> {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('id', sql.Int, id)
                .execute('DeleteUser');
        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            throw new Error('Failed to delete user');
        }
    }
}
