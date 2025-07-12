import { Router } from "express";
import { userValidate, loginValidate } from "../middleware/Validate.js";
import { checkAuthMiddleware } from "../middleware/checkAuthMiddleware.js";

import { signup, login, logout, checkAuth } from "../controllers/auth.controller.js";

const router = Router();

router.post('/signup', userValidate, signup);
router.post('/login', loginValidate, login);
router.post('/logout', logout);

router.get('/check-auth', checkAuthMiddleware, checkAuth);

export default router;