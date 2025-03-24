import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/register', userController.registerUser);
// router.post('/login', userController.loginUser);
router.get('/', userController.getAllUsers);
// router.get('/:userId', userController.getUserById); 

router.get('/role/:role', userController.getUsersByRole);
router.get('/faculty/:faculty', userController.getUsersByFaculty);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

export default router;
