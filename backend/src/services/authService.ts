import { Seeker } from '../interfaces/Seeker';
import { Admin } from '../interfaces/Admin';
import { Counselor } from '../interfaces/Counselor';
import { poolPromise, sql } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
    // Auto-add counselors as friends for new users
    private async autoAddCounselors(userId: number): Promise<void> {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('NewUserId', sql.Int, userId)
                .execute('AutoAddCounselorFriends');
        } catch (error) {
            console.error('Failed to auto-add counselor friends:', error);
            // Optional: don't block registration if this fails
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

            // Get the newly created user's ID
            const newUserId = result.recordset[0].id;
            // Auto-add counselors after registration
            await this.autoAddCounselors(newUserId);

            return newUserId;
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

    // Login user and generate JWT token
    async login(email: string, password: string): Promise<{ token: string; user: any }> {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const pool = await poolPromise;
            const request = pool.request();

            // Find user by email
            request.input('email', sql.NVarChar, email);
            const result = await request.query(`SELECT * FROM Users WHERE email = @email`);

            if (result.recordset.length === 0) {
                throw new Error('No account found with this email');
            }

            const user = result.recordset[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Incorrect password');
            }

            // Generate token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );

            // Remove sensitive fields from user object before returning
            const { password: _, ...userWithoutPassword } = user;

            // Auto-add counselors after login (optional but helps ensure older accounts are auto-friended)
            await this.autoAddCounselors(user.id);

            return {
                token,
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Login error:', error);

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

  
    async getProfileDetails(userId: number): Promise<any> { // 🚫 No role here
        try {
            const pool = await poolPromise;
            const request = pool.request();
    
            if (!userId || isNaN(userId)) {
                throw new Error('Invalid userId');
            }
    
            request.input('UserId', sql.Int, userId);
    
            const result = await request.execute('GetUserProfile');
    
            if (!result.recordset || result.recordset.length === 0) {
                throw new Error('Profile not found');
            }
    
            return result.recordset[0];
        } catch (error) {
            console.error('Service - Get Profile Details Error:', error);
            throw error;
        }
    }
    

// Update Seeker Profile
async updateSeekerProfile(userId: number, seekerData: Partial<Seeker>): Promise<void> {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        request.input('UserId', sql.Int, userId);
        request.input('Name', sql.NVarChar, seekerData.name || null);
        request.input('Email', sql.NVarChar, seekerData.email || null);
        request.input('Faculty', sql.NVarChar, seekerData.faculty || null);
        request.input('WantsDailyEmails', sql.Bit, seekerData.wantsDailyEmails ?? 0); // Default to 0 if null

        await request.execute('UpdateSeekerProfile');
    } catch (error) {
        console.error('Service - Update Seeker Profile Error:', error);
        throw error; // Re-throw original error
    }
}

// Update Counselor Profile
async updateCounselorProfile(userId: number, counselorData: Partial<Counselor>): Promise<void> {
    try {
        if (!counselorData.profileImage) {
            throw new Error('Profile image is required for counselors');
        }

        const pool = await poolPromise;
        const request = pool.request();

        request.input('UserId', sql.Int, userId);
        request.input('Name', sql.NVarChar, counselorData.name || null);
        request.input('Email', sql.NVarChar, counselorData.email || null);
        request.input('ProfileImage', sql.NVarChar, counselorData.profileImage);
        request.input('Specialization', sql.NVarChar, counselorData.specialization || null);
        request.input('AvailabilitySchedule', sql.NVarChar, counselorData.availabilitySchedule || null);

        await request.execute('UpdateCounselorProfile');
    } catch (error) {
        console.error('Service - Update Counselor Profile Error:', error);
        throw error; // Re-throw original error
    }
}

async updateUserRole(userId: number, newRole: string): Promise<void> {
    try {
        if (!['seeker', 'counselor', 'admin'].includes(newRole.toLowerCase())) {
            throw new Error('Invalid role specified');
        }

        const pool = await poolPromise;
        const request = pool.request();

        request.input('userId', sql.Int, userId);
        request.input('newRole', sql.NVarChar, newRole);

        await request.execute('UpdateUserRole');
    } catch (error) {
        console.error('Update User Role Error:', error);
        throw new Error('Failed to update user role');
    }
}

// Upload and update profile image for a user
async uploadProfileImage(userId: number, imagePath: string): Promise<void> {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        request.input('UserId', sql.Int, userId);
        request.input('ProfileImage', sql.NVarChar, imagePath); // Path to saved image (e.g., URL or local path)

        await request.execute('UpdateUserProfileImage');
    } catch (error) {
        console.error('Service - Upload Profile Image Error:', error);
        throw new Error('Failed to upload profile image');
    }
}

}


// Export an instance of the class
export default new AuthService();