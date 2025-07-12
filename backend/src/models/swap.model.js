import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesterSkill: {
        type: String,
        required: true,
        trim: true
    },
    recipientSkill: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 500,
        trim: true
    },
    scheduledDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Add indexes for better performance
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ recipient: 1, status: 1 });

export default mongoose.model('Swap', swapSchema);