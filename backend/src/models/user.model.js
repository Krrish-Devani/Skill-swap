import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: null,
    },

    location: {
        type: String,
    },
    bio: {
        type: String,
        default: '',
    },
    skillsOffered: {
        type: [String],
        default: [],
    },
    skillsWanted: {
        type: [String],
        default: [],
    },

    availability: {
        type: String,
        enum: ['weekdays', 'weekends', 'anytime', 'not available'],
        default: 'not available',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

export default User;
