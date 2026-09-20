import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ensureStaffSchema, testConnection, default as pool } from './config/database.js';
import { errorHandler } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import crowdRoutes from './routes/crowdRoutes.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

const configuredFrontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const localDevelopmentOrigins = [
  configuredFrontendOrigin,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || localDevelopmentOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by DarshanSetu CORS policy'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {

    await testConnection();
    await ensureStaffSchema();

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

startServer();

export default app;