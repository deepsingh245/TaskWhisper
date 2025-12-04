import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';
import authRoutes from './routes/auth.routes';
import voiceRoutes from './routes/voice.routes';
import errorHandler from './utils/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/voice', voiceRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('TaskWhisper Backend is running!');
});

// Error Handling
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
