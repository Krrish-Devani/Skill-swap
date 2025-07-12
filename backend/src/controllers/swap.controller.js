import Swap from '../models/swap.model.js';
import User from '../models/user.model.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import ExpressError from '../lib/ExpressError.js';

// Create a new swap request
export const createSwapRequest = wrapAsync(async (req, res) => {
    const { recipientId, requesterSkill, recipientSkill, message } = req.body;
    const requesterId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        throw new ExpressError(404, 'Recipient not found');
    }

    // Don't allow swapping with yourself
    if (requesterId.toString() === recipientId) {
        throw new ExpressError(400, 'Cannot create swap request with yourself');
    }

    // Check for existing pending request between same users
    const existingSwap = await Swap.findOne({
        requester: requesterId,
        recipient: recipientId,
        status: 'pending'
    });

    if (existingSwap) {
        throw new ExpressError(400, 'Pending swap request already exists with this user');
    }

    const swap = new Swap({
        requester: requesterId,
        recipient: recipientId,
        requesterSkill,
        recipientSkill,
        message
    });

    await swap.save();
    await swap.populate(['requester', 'recipient'], 'fullName email profilePic');

    res.status(201).json({
        message: 'Swap request sent successfully',
        swap
    });
});

// Get all swap requests for current user (sent and received)
export const getMySwapRequests = wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const { type } = req.query; // 'sent', 'received', or undefined for all

    let filter = {};
    
    if (type === 'sent') {
        filter.requester = userId;
    } else if (type === 'received') {
        filter.recipient = userId;
    } else {
        filter = {
            $or: [
                { requester: userId },
                { recipient: userId }
            ]
        };
    }

    const swaps = await Swap.find(filter)
        .populate('requester', 'fullName email profilePic')
        .populate('recipient', 'fullName email profilePic')
        .sort({ createdAt: -1 });

    res.json({ 
        success: true,
        swaps 
    });
});

// Accept a swap request
export const acceptSwapRequest = wrapAsync(async (req, res) => {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId)
        .populate('requester', 'fullName email')
        .populate('recipient', 'fullName email');

    if (!swap) {
        throw new ExpressError(404, 'Swap request not found');
    }

    // Only recipient can accept
    if (swap.recipient._id.toString() !== userId.toString()) {
        throw new ExpressError(403, 'You can only accept swap requests sent to you');
    }

    // Can only accept pending requests
    if (swap.status !== 'pending') {
        throw new ExpressError(400, 'This swap request is no longer pending');
    }

    swap.status = 'accepted';
    await swap.save();

    res.json({
        message: 'Swap request accepted successfully',
        swap
    });
});

// Reject a swap request
export const rejectSwapRequest = wrapAsync(async (req, res) => {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId)
        .populate('requester', 'fullName email')
        .populate('recipient', 'fullName email');

    if (!swap) {
        throw new ExpressError(404, 'Swap request not found');
    }

    // Only recipient can reject
    if (swap.recipient._id.toString() !== userId.toString()) {
        throw new ExpressError(403, 'You can only reject swap requests sent to you');
    }

    // Can only reject pending requests
    if (swap.status !== 'pending') {
        throw new ExpressError(400, 'This swap request is no longer pending');
    }

    swap.status = 'rejected';
    await swap.save();

    res.json({
        message: 'Swap request rejected',
        swap
    });
});

// Cancel a swap request (for requester)
export const cancelSwapRequest = wrapAsync(async (req, res) => {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
        throw new ExpressError(404, 'Swap request not found');
    }

    // Only requester can cancel
    if (swap.requester.toString() !== userId.toString()) {
        throw new ExpressError(403, 'You can only cancel swap requests you created');
    }

    // Can only cancel pending requests
    if (swap.status !== 'pending') {
        throw new ExpressError(400, 'Can only cancel pending swap requests');
    }

    await Swap.findByIdAndDelete(swapId);

    res.json({
        message: 'Swap request cancelled successfully'
    });
});

// Complete a swap (mark as completed)
export const completeSwap = wrapAsync(async (req, res) => {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId)
        .populate('requester', 'fullName email')
        .populate('recipient', 'fullName email');

    if (!swap) {
        throw new ExpressError(404, 'Swap not found');
    }

    // Both requester and recipient can mark as completed
    const isParticipant = swap.requester._id.toString() === userId.toString() || 
                         swap.recipient._id.toString() === userId.toString();

    if (!isParticipant) {
        throw new ExpressError(403, 'You are not part of this swap');
    }

    // Can only complete accepted swaps
    if (swap.status !== 'accepted') {
        throw new ExpressError(400, 'Can only complete accepted swaps');
    }

    swap.status = 'completed';
    await swap.save();

    res.json({
        message: 'Swap marked as completed',
        swap
    });
});

// Get swap details by ID
export const getSwapDetails = wrapAsync(async (req, res) => {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId)
        .populate('requester', 'fullName email profilePic skillsOffered')
        .populate('recipient', 'fullName email profilePic skillsOffered');

    if (!swap) {
        throw new ExpressError(404, 'Swap not found');
    }

    // Only participants can view swap details
    const isParticipant = swap.requester._id.toString() === userId.toString() || 
                         swap.recipient._id.toString() === userId.toString();

    if (!isParticipant) {
        throw new ExpressError(403, 'You can only view swaps you are part of');
    }

    res.json({ swap });
});
