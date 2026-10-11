import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { initializeDatabase, default as pool } from './config/database.js';
import { errorHandler } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import crowdRoutes from './routes/crowdRoutes.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isAllowedOrigin = (origin, candidates) => {
  if (!origin) return true;

  return candidates.some(candidate => {
    if (!candidate) return false;
    if (candidate === origin) return true;
    if (candidate.includes('*')) {
      const pattern = new RegExp(`^${candidate.split('*').map(escapeRegex).join('.*')}$`);
      return pattern.test(origin);
    }
    return false;
  });
};

const allowedOrigins = [
  ...parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
  process.env.FRONTEND_URL,
  'https://darshna-setu.vercel.app',
  'https://*.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin, allowedOrigins)) return callback(null, true);
    return callback(new Error('Origin is not allowed by DarshanSetu CORS policy'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  const isDemoLogin = req.method === 'POST'
    && req.path === '/api/auth/login'
    && req.body?.mobile === '9876543210'
    && req.body?.password === 'password123';

  if (req.path === '/api/health' || req.path === '/api/health/database' || isDemoLogin) return next();

  try {
    await initializeDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/crowd', crowdRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DarshanSetu Backend is running',
    timestamp: new Date()
  });
});

app.get('/api/health/database', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    return res.status(200).json({ success: true, database: 'connected' });
  } catch (error) {
    console.error('Database readiness check failed:', error.message);
    let detail = String(error.message || '');
    for (const [key, value] of Object.entries(process.env)) {
      if (/^(DATABASE|DB_|PGHOST|PGUSER|PGPASSWORD)/.test(key) && value) {
        detail = detail.replaceAll(value, '[redacted]');
      }
    }
    return res.status(503).json({
      success: false,
      stage: 'database_initialization',
      code: error.code || error.name || 'DATABASE_ERROR',
      detail: detail.slice(0, 180)
    });
  } finally {
    client?.release();
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {

    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`\n✅ DarshanSetu Backend Server is running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('\n📚 API Documentation:');
      console.log('   Auth Routes: /api/auth/*');
      console.log('   Booking Routes: /api/bookings/*');
      console.log('   Admin Routes: /api/admin/* (requires admin role)');
      console.log('   Notification Routes: /api/notifications/*');
      console.log('   Crowd Routes: /api/crowd/*');
      console.log('   Health Check: /api/health\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;