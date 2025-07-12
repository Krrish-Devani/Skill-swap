import jwt from 'jsonwebtoken';
import ExpressError from '../lib/ExpressError.js';
import User from '../models/user.model.js';
import { wrapAsync } from '../lib/wrapAsync.js';

export const checkAuthMiddleware = wrapAsync(async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return next(new ExpressError(401, 'Unauthorized: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        return next(new ExpressError(401, 'Unauthorized: Invalid token'));
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
        return next(new ExpressError(404, 'User not found'));
    }

    req.user = user;
    next();
});