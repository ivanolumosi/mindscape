import express, { Request, Response } from 'express';
import AuthController from '../controllers/authController';

const router = express.Router();

// User Registration Route
router.post('/register', async (req: Request, res: Response) => {
    await AuthController.register(req, res);
});

// User Login Route
router.post('/login', async (req: Request, res: Response) => {
    await AuthController.login(req, res);
});

// User Logout Route
router.post('/logout', async (req: Request, res: Response) => {
    await AuthController.logout(req, res);
});

export default router;