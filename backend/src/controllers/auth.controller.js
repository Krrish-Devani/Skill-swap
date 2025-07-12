import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

import { wrapAsync } from '../lib/wrapAsync.js';
import { generateToken } from '../lib/generateToken.js';
import ExpressError from '../lib/ExpressError.js';

export const signup = wrapAsync(async (req, res) => {
    const { fullName, email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        throw new ExpressError(400, 'User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        email,
        fullName,
        password: hashedPassword,
    })

    if (newUser) {
        generateToken(newUser._id, res);
        await newUser.save();
        return res.status(201).json({
            message: 'User created successfully',
            user: {
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
            }
        });
    } else {
        throw new ExpressError(500, 'User creation failed');
    }
});

export const login = wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ExpressError(400, 'Invalid email or password');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new ExpressError(400, 'Invalid Credentials');
    }
    
    generateToken(user._id, res);

    return res.status(200).json({
        message: 'Login successful',
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
        }
    })
});

export const logout = wrapAsync(async (req, res) => {
    res.clearCookie('jwt', '', {
        maxAge: 0,
    });

    return res.status(200).json({ message: 'Logout successful' });
});

export const checkAuth = wrapAsync(async (req, res) => {
    res.status(200).json(req.user);
});