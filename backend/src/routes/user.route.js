import { Router } from 'express';
import { checkAuthMiddleware } from '../middleware/checkAuthMiddleware.js';
import {
    getAllUsers,
    getUserProfile,
    updateProfile,
    getMyProfile
} from '../controllers/user.controller.js';

const router = Router();

router.get('/', getAllUsers);

router.get('/me', checkAuthMiddleware, getMyProfile);
router.put('/me', checkAuthMiddleware, updateProfile);
router.get('/profile/:userId', checkAuthMiddleware, getUserProfile);

export default router;
