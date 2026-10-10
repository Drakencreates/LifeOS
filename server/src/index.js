
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { seedDemoUser } from './lib/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Locate the Vite dist folder from this file's location.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist');

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      ...(process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : [])
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LifeOS API Server',
    phase: 'Phase 7: Dashboard Analytics & Global Search',
    timestamp: new Date().toISOString()
  });
});

// Unknown API routes must not return the frontend HTML.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found.`
  });
});

// Serve the built React frontend.
app.use(express.static(distPath));

// Return index.html for frontend routes, including React Router paths.
app.get(/.*/, (req, res, next) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`LifeOS server listening on port ${PORT}`);

  try {
    await seedDemoUser();
  } catch (err) {
    console.error('Demo-user seeding failed:', err);
  }
});

export default app;
