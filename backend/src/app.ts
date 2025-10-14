import express from 'express';
import cors from 'cors';
import positionRoutes from './routes/positionRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/positions', positionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
