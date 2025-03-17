import { Request, Response } from 'express';
import * as authService from '../services/authservice';

// ✅ Helper function for error messages
const getErrorMessage = (err: unknown): string => err instanceof Error ? err.message : 'An unknown error occurred';

// ✅ Register a New User
export const registerUser = async (req: Request, res: Response) => {
    try {
        await authService.registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: getErrorMessage(error) });
    }
};

// ✅ User Login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        res.status(200).json(user);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};

// ✅ Request Password Reset
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email, resetToken } = req.body;
        if (!email || !resetToken) return res.status(400).json({ error: 'Email and reset token are required' });

        await authService.requestPasswordReset(email, resetToken);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};

// ✅ Request Email Verification Code
export const requestVerificationCode = async (req: Request, res: Response) => {
    try {
        const { email, verificationCode } = req.body;
        if (!email || !verificationCode) return res.status(400).json({ error: 'Email and verification code are required' });

        await authService.requestVerificationCode(email, verificationCode);
        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Error requesting verification code:', error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};
