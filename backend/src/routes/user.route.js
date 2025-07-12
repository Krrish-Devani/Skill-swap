import { Router } from 'express';
import { checkAuthMiddleware } from '../middleware/checkAuthMiddleware.js';
import {
    getAllUsers,
    getUserProfile,
    updateProfile,
    getMyProfile,
    browseUsers,
    updateProfilePicture
} from '../controllers/user.controller.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/browse', checkAuthMiddleware, browseUsers);

router.get('/me', checkAuthMiddleware, getMyProfile);
router.put('/me', checkAuthMiddleware, updateProfile);
router.put('/me/profile-picture', checkAuthMiddleware, updateProfilePicture);
router.get('/profile/:userId', checkAuthMiddleware, getUserProfile);

export default router;
