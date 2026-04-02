import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes placeholder
app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// Anime routes placeholder
app.get('/api/anime/season', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
