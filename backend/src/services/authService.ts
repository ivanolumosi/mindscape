import { poolPromise, sql } from '../db';
import bcrypt from 'bcrypt';
import { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationCode } from './emailService';
import { Seeker } from '../interfaces/Seeker';
import { Admin } from '../interfaces/Admin';
import { Counselor } from '../interfaces/Counselor';

export type User = Seeker | Admin | Counselor;

// ✅ Check if Email Already Exists Before Registration
const isEmailTaken = async (email: string): Promise<boolean> => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('email', sql.NVarChar(100), email)
        .query('SELECT COUNT(*) AS count FROM Users WHERE email = @email');

    return result.recordset[0].count > 0;
};

// ✅ Register a New User & Send Welcome Email
export const registerUser = async (user: User): Promise<void> => {
    try {
        const { name, email, password, role } = user;

        // ❌ Check if email is already registered
        if (await isEmailTaken(email)) {
            throw new Error('Email is already in use.');
        }

        const hashedPassword = await bcrypt.hash(password!, 10);

        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar(100), name)
            .input('email', sql.NVarChar(100), email)
            .input('password', sql.NVarChar(255), hashedPassword)
            .input('role', sql.NVarChar(50), role)
            .execute('AddUser');

        // ✅ Send Welcome Email
        await sendWelcomeEmail(email, name);
    } catch (error) {
        console.error('Error registering user:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to register user');
    }
};

// ✅ User Login (Authentication)
export const loginUser = async (email: string, password: string): Promise<User | null> => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar(100), email)
            .execute('GetUserByEmail');

        if (result.recordset.length === 0) {
            throw new Error('Invalid email or password.');
        }

        const user = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password.');
        }

        return user;
    } catch (error) {
        console.error('Error logging in:', error);
        throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
};

// ✅ Send Verification Code via Email
export const requestVerificationCode = async (email: string, verificationCode: string): Promise<void> => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('email', sql.NVarChar(100), email)
            .input('verificationCode', sql.NVarChar(6), verificationCode)
            .execute('VerifyEmail');

        await sendVerificationCode(email, verificationCode);
    } catch (error) {
        console.error('Error sending verification code:', error);
        throw new Error('Failed to send verification email');
    }
};

// ✅ Password Reset Request
export const requestPasswordReset = async (email: string, resetToken: string): Promise<void> => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('email', sql.NVarChar(100), email)
            .input('resetToken', sql.NVarChar(255), resetToken)
            .execute('RequestPasswordReset');

        await sendPasswordResetEmail(email, resetToken);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
