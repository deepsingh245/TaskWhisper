import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('TaskWhisper Backend is running!');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
