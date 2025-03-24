import { Seeker } from '../interfaces/Seeker';
import { Admin } from '../interfaces/Admin';
import { Counselor } from '../interfaces/Counselor';
import { poolPromise, sql } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
    // Login user and generate JWT token
    async login(email: string, password: string): Promise<string> {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Prepare connection
            const pool = await poolPromise;
            const request = pool.request();

            // Find user by email
            request.input('email', sql.NVarChar, email);
            const result = await request.query(
                `SELECT * FROM Users WHERE email = @email`
            );

            // Check if user exists
            if (result.recordset.length === 0) {
                throw new Error('No account found with this email');
            }

            const user = result.recordset[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(
                password, 
                user.password
            );

            if (!isPasswordValid) {
                throw new Error('Incorrect password');
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role 
                },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );

            return token;
        } catch (error) {
            console.error('Login error:', error);
            
            // Provide more specific error messages
            if (error instanceof Error) {
                switch (error.message) {
                    case 'No account found with this email':
                        throw new Error('No account found with this email address');
                    case 'Incorrect password':
                        throw new Error('Invalid email or password');
                    case 'Email and password are required':
                        throw new Error('Email and password are required');
                    default:
                        throw new Error('Unable to complete login');
                }
            }
            
            throw new Error('Login process failed');
        }
    }

    // Register a new user
    async register(userData: Seeker | Admin | Counselor): Promise<number> {
        try {
            // Validate input
            this.validateRegistrationInput(userData);

            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(userData.password || '', 10);

            // Prepare connection
            const pool = await poolPromise;
            const request = pool.request();

            // Set parameters based on the user type
            request.input('name', sql.NVarChar, userData.name);
            request.input('email', sql.NVarChar, userData.email);
            request.input('password', sql.NVarChar, hashedPassword);
            request.input('role', sql.NVarChar, userData.role);

            // Optional fields with type-specific handling
            request.input('profile_image', sql.NVarChar, 
                (userData as Counselor).profileImage || null);
            request.input('specialization', sql.NVarChar, 
                (userData as Counselor).specialization || null);
            request.input('faculty', sql.NVarChar, 
                (userData as Seeker).faculty || null);
            request.input('privileges', sql.NVarChar, 
                (userData as Admin).privileges || null);
            request.input('availability_schedule', sql.NVarChar, 
                (userData as Counselor).availabilitySchedule || null);

            // Execute the stored procedure
            const result = await request.execute('AddUser');

            // Check if any error was returned
            if (result.recordset.length > 0 && result.recordset[0].ErrorNumber) {
                throw new Error(result.recordset[0].ErrorMessage);
            }

            // Return the newly created user's ID
            return result.recordset[0].id;
        } catch (error) {
            console.error('Registration error:', error);
            
            // Provide more specific error messages
            if (error instanceof Error) {
                switch (error.message) {
                    case 'Email already registered':
                        throw new Error('This email is already in use');
                    case 'Name cannot be empty':
                    case 'Email cannot be empty':
                    case 'Password cannot be empty':
                    case 'Role cannot be empty':
                        throw new Error('Invalid input data');
                    default:
                        throw new Error('Unable to complete registration');
                }
            }
            
            throw new Error('Registration process failed');
        }
    }

    // Validate registration input
    private validateRegistrationInput(userData: Seeker | Admin | Counselor): void {
        // Check name
        if (!userData.name || userData.name.trim() === '') {
            throw new Error('Name is required');
        }

        // Check email
        if (!userData.email || !this.isValidEmail(userData.email)) {
            throw new Error('Invalid email address');
        }

        // Check password
        if (!userData.password || !this.isPasswordComplex(userData.password)) {
            throw new Error('Password does not meet complexity requirements');
        }

        // Check role
        if (!userData.role || !['seeker', 'admin', 'counselor'].includes(userData.role.toLowerCase())) {
            throw new Error('Invalid user role');
        }
    }

    // Email validation
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password complexity checker
    private isPasswordComplex(password: string): boolean {
        // At least 8 characters long
        // Contains at least one uppercase letter
        // Contains at least one lowercase letter
        // Contains at least one number
        // Contains at least one special character
        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return complexityRegex.test(password);
    }
}

// Export an instance of the class
export default new AuthService();