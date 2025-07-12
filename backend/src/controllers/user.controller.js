import User from '../models/user.model.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import ExpressError from '../lib/ExpressError.js';

export const getAllUsers = wrapAsync(async (req, res) => {
    const { search, skill, location } = req.query;
    
    let filter = { isPublic: true };
    
    // Search by name
    if (search) {
        filter.fullName = { $regex: search, $options: 'i' };
    }
    
    // Filter by skill
    if (skill) {
        filter.skillsOffered = { $in: [new RegExp(skill, 'i')] };
    }
    
    // Filter by location
    if (location) {
        filter.location = { $regex: location, $options: 'i' };
    }
    
    const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 });
    
    res.json({ users });
});

export const getUserProfile = wrapAsync(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
        throw new ExpressError(404, 'User not found');
    }
    
    if (!user.isPublic) {
        throw new ExpressError(403, 'Profile is private');
    }
    
    res.json({ user });
});

export const updateProfile = wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates.password;
    delete updates.email;
    delete updates._id;
    
    const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
        throw new ExpressError(404, 'User not found');
    }
    
    res.json({ 
        message: 'Profile updated successfully',
        user 
    });
});

export const getMyProfile = wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
});