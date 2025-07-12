import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    swap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Swap',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500,
        trim: true
    }
}, {
    timestamps: true
});

// Prevent duplicate feedback for same swap from same reviewer
feedbackSchema.index({ swap: 1, reviewer: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);