import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import goalRoutes from './routes/GoalRoute';
import resourceRoutes from './routes/resourceRoutes'; // ✅ Import resource routes
import moodTrackerRoutes from './routes/moodTrackerRoutes';
import dailyJournalRoutes from './routes/dailyJournalRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import chatApplicationRoutes from './routes/chatApplicationRoutes';
import crisisRoutes from './routes/crisisRoutes';
import friendsRoutes from './routes/friendsRoutes';
import notificationsRoutes from './routes/notificationsRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Ensure Express can parse JSON requests

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/resources', resourceRoutes); 
app.use('/api/moods', moodTrackerRoutes);
app.use('/api/journal', dailyJournalRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/chat', chatApplicationRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationsRoutes);


// ✅ Root Route
app.get('/', (req, res) => {
    res.send('🚀 Welcome to the API!');
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
