import User from '../models/user.model.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import ExpressError from '../lib/ExpressError.js';
import cloudinary from '../lib/cloudinary.js';

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
    delete updates.fullName;  // Full name cannot be changed after signup
    delete updates._id;
    
    // Handle profile picture upload if provided
    if (updates.profilePic && updates.profilePic.startsWith('data:image')) {
        try {
            console.log('Uploading profile picture to Cloudinary...'); // Debug log
            const uploadResult = await cloudinary.uploader.upload(updates.profilePic, {
                folder: 'skill-swap/profile-pics',
                transformation: [
                    { width: 400, height: 400, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });
            updates.profilePic = uploadResult.secure_url;
            console.log('Cloudinary upload successful:', uploadResult.secure_url); // Debug log
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new ExpressError(500, 'Failed to upload profile picture');
        }
    }
    
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

export const browseUsers = wrapAsync(async (req, res) => {
    // Get all public users except the current user
    const users = await User.find({ 
        isPublic: true,
        _id: { $ne: req.user._id }
    })
    .select('-password')
    .sort({ createdAt: -1 });
    
    res.json(users);
});

export const updateProfilePicture = wrapAsync(async (req, res) => {
    console.log('Profile picture upload request received'); // Debug log
    const userId = req.user._id;
    const { profilePic } = req.body;

    console.log('User ID:', userId); // Debug log
    console.log('Profile pic received:', profilePic ? 'Yes' : 'No'); // Debug log

    if (!profilePic) {
        throw new ExpressError(400, 'Profile picture is required');
    }

    try {
        console.log('Uploading to Cloudinary...'); // Debug log
        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(profilePic, {
            folder: 'skill-swap/profile-pics',
            transformation: [
                { width: 400, height: 400, crop: 'fill' },
                { quality: 'auto' }
            ]
        });

        console.log('Cloudinary upload successful:', uploadResult.secure_url); // Debug log

        // Update user's profile picture
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResult.secure_url },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new ExpressError(404, 'User not found');
        }

        console.log('Database updated successfully'); // Debug log

        res.json({
            message: 'Profile picture updated successfully',
            user
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw new ExpressError(500, 'Failed to upload profile picture');
    }
});