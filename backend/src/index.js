import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './lib/mongoDB.js';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import swapRoutes from './routes/swap.route.js';

dotenv.config();

const app = express(); 

const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}))

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Skill Swap API is running!' });
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).json({message});
})

app.listen(PORT, () => {
    console.log(`Server is running on the port http://localhost:${PORT}`);
    connectDB();
})