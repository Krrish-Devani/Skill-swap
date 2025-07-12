import jwt from 'jsonwebtoken';
import ExpressError from '../lib/ExpressError.js';
import User from '../models/user.model.js';
import { wrapAsync } from '../lib/wrapAsync.js';

export const checkAuthMiddleware = wrapAsync(async (req, res, next) => {
    console.log('Auth middleware called for:', req.method, req.path); // Debug log
    const token = req.cookies.jwt;

    if (!token) {
        console.log('No token found in cookies'); // Debug log
        return next(new ExpressError(401, 'Unauthorized: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        console.log('Invalid token'); // Debug log
        return next(new ExpressError(401, 'Unauthorized: Invalid token'));
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
        console.log('User not found for token'); // Debug log
        return next(new ExpressError(404, 'User not found'));
    }

    console.log('Auth successful for user:', user.email); // Debug log
    req.user = user;
    next();
});