import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import connectDB from './config/database.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { seedData } from './utils/seedData.js';

// Routes
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import tagRoutes from './routes/tags.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tags', tagRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StackIt API is running' });
});

// Seed data route (only in development)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/seed', async (req, res) => {
    try {
      await seedData();
      res.json({ message: 'Sample data seeded successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to seed data', error: error.message });
    }
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🚀 Development Setup:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Update MONGO_URI in .env file');
    console.log('3. Visit http://localhost:3000 for the frontend');
    console.log('4. API available at http://localhost:5000/api');
    console.log('5. POST to /api/seed to add sample data\n');
  }
});