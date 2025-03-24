import { Request, Response } from 'express';
import AuthService from '../services/authService';
import { Seeker } from '../interfaces/Seeker';
import { Admin } from '../interfaces/Admin';
import { Counselor } from '../interfaces/Counselor';

class AuthController {
    // User Registration
    static async register(req: Request, res: Response): Promise<Response> {
        try {
            const userData: Seeker | Admin | Counselor = req.body;

            // Validate required fields
            if (!userData.name || !userData.email || !userData.password) {
                return res.status(400).json({ 
                    message: 'Name, email, and password are required' 
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                return res.status(400).json({ 
                    message: 'Invalid email format' 
                });
            }

            // Validate password strength
            if (userData.password.length < 8) {
                return res.status(400).json({ 
                    message: 'Password must be at least 8 characters long' 
                });
            }

            // Attempt user registration
            const userId = await AuthService.register(userData);

            return res.status(201).json({ 
                message: 'User registered successfully', 
                userId 
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ 
                message: 'Registration failed', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    // User Login
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const token = await AuthService.login(email, password);

            // Validate input
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Email and password are required' 
                });
            }

            
            // Set token in HTTP-only cookie for added security
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            return res.status(200).json({ 
                message: 'Login successful', 
                token 
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(401).json({ 
                message: 'Login failed', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    // User Logout
    static async logout(req: Request, res: Response): Promise<Response> {
        try {
            // Clear the authentication cookie
            res.clearCookie('auth_token');

            return res.status(200).json({ 
                message: 'Logout successful' 
            });
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({ 
                message: 'Logout failed', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }
}

export default AuthController;