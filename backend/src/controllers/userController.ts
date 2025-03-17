import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

// ✅ Register a New User (No Email)
export const registerUser = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.registerUser(req.body.name, req.body.email, req.body.password, req.body.role, req.body.faculty);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
};

// ✅ Login User 
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await userService.loginUser(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ✅ Get User by ID 
export const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error fetching user with ID ${req.params.userId}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// ✅ Get All Users
export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


// ✅ Get Users by Role
export const getUsersByRole = async (req: Request, res: Response) => {
    try {
        const role = req.params.role;
        const users = await userService.getUsersByRole(role);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users by role' });
    }
};

// ✅ Get Seekers by Faculty
export const getUsersByFaculty = async (req: Request, res: Response) => {
    try {
        const faculty = req.params.faculty;
        const seekers = await userService.getUsersByFaculty(faculty);
        res.status(200).json(seekers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch seekers by faculty' });
    }
};

// ✅ Update User
export const updateUser = async (req: Request, res: Response) => {
    try {
        await userService.updateUser(Number(req.params.userId), req.body);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// ✅ Delete User
export const deleteUser = async (req: Request, res: Response) => {
    try {
        await userService.deleteUser(Number(req.params.userId));
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
