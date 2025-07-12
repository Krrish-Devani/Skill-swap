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
            _id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            profilePic: newUser.profilePic,
            location: newUser.location,
            bio: newUser.bio,
            skillsOffered: newUser.skillsOffered,
            skillsWanted: newUser.skillsWanted,
            availability: newUser.availability,
            isPublic: newUser.isPublic,
            createdAt: newUser.createdAt
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
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        location: user.location,
        bio: user.bio,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        isPublic: user.isPublic,
        createdAt: user.createdAt
    })
});

export const logout = wrapAsync(async (req, res) => {
    res.clearCookie('jwt', '', {
        maxAge: 0,
    });

    return res.status(200).json({ message: 'Logout successful' });
});

export const checkAuth = wrapAsync(async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic,
        location: req.user.location,
        bio: req.user.bio,
        skillsOffered: req.user.skillsOffered,
        skillsWanted: req.user.skillsWanted,
        availability: req.user.availability,
        isPublic: req.user.isPublic,
        createdAt: req.user.createdAt
    });
});