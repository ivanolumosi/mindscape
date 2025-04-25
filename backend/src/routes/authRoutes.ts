import express, { Request, Response } from 'express';
import multer from 'multer';  // <-- 🛠️ Import multer here
import AuthController from '../controllers/authController';

const router = express.Router();

// 🛠️ Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/profile-images/', // Make sure this folder exists!
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage }); // <-- 🛠️ Define `upload` here

// ✅ Now you can use `upload` below...

// 1️⃣ Register
router.post('/register', async (req: Request, res: Response) => {
    await AuthController.register(req, res);
});

// 2️⃣ Login
router.post('/login', async (req: Request, res: Response) => {
    await AuthController.login(req, res);
});

// 3️⃣ Logout
router.post('/logout', async (req: Request, res: Response) => {
    await AuthController.logout(req, res);
});

// 4️⃣ Get Profile Details
router.get('/profile/details', async (req: Request, res: Response) => {
    await AuthController.getProfileDetails(req, res);
});

// 5️⃣ Update Seeker Profile
router.put('/profile/seeker', async (req: Request, res: Response) => {
    await AuthController.updateSeekerProfile(req, res);
});

// 6️⃣ Update Counselor Profile
router.put('/profile/counselor', async (req: Request, res: Response) => {
    await AuthController.updateCounselorProfile(req, res);
});

// 7️⃣ Update User Role
router.put('/role/update', async (req: Request, res: Response) => {
    await AuthController.updateUserRole(req, res);
});

// 🖼️ 8️⃣ Upload Profile Image (NEW Route)
router.post(
  '/profile/upload-profile-image', 
  upload.single('file'), // <-- 🛠️ Multer middleware here
  async (req: Request, res: Response) => {
    await AuthController.uploadProfileImage(req, res);
  }
);

export default router;
