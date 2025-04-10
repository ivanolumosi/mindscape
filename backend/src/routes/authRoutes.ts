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

// 3️⃣ 🚪 Logout
router.post('/logout', async (req: Request, res: Response) => {
    await AuthController.logout(req, res);
});

// 4️⃣ 👤 Get Profile Details
router.get('/profile/details', async (req: Request, res: Response) => {
    await AuthController.getProfileDetails(req, res);
});

// 5️⃣ ✍️ Update Seeker Profile
router.put('/profile/seeker', async (req: Request, res: Response) => {
    await AuthController.updateSeekerProfile(req, res);
});

// 6️⃣ ✍️ Update Counselor Profile
router.put('/profile/counselor', async (req: Request, res: Response) => {
    await AuthController.updateCounselorProfile(req, res);
});

// 7️⃣ 🛡️ Update User Role
router.put('/role/update', async (req: Request, res: Response) => {
    await AuthController.updateUserRole(req, res);
});


export default router;