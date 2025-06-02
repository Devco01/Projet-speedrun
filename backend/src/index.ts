import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import runRoutes from './routes/runRoutes';
import eventRoutes from './routes/eventRoutes';

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Database connections
async function connectDB() {
  try {
    // PostgreSQL via Prisma
    await prisma.$connect();
    console.log('PostgreSQL connected via Prisma');
    
    // MongoDB via Mongoose
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected via Mongoose');
    }
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/events', eventRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API SpeedRun Platform opérationnelle !');
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 