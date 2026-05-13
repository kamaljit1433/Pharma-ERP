import path from 'path';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import passport from 'passport';
import config from './config';
import database from './config/database';
import redisClient from './config/redis';
import sessionMiddleware from './middleware/session';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import fileStorageRoutes from './routes/fileStorageRoutes';
import emailRoutes from './routes/emailRoutes';
import { createLeaveRoutes } from './routes/leave';
import { createPayrollRoutes } from './routes/payroll';
import { createBenefitsRoutes } from './routes/benefits';
import { createPerformanceRoutes } from './routes/performance';
import employeeRoutes from './routes/employees';
import recruitmentRoutes from './routes/recruitment';
import trainingRoutes from './routes/training';
import separationRoutes from './routes/separation';
import assetRoutes from './routes/assets';
import { createGeoTrackingRoutes } from './routes/geo-tracking';
import { createHierarchyRoutes } from './routes/hierarchy';
import { createSuppliersRoutes } from './routes/suppliers';
import { createBankDetailsRoutes } from './routes/bankDetails';
import { createDocumentRoutes } from './routes/documents';
import { createESignatureRoutes } from './routes/esignature';
import { createNotificationRoutes } from './routes/notifications';
import attendanceRoutes from './routes/attendance';
import dashboardRoutes from './routes/dashboard';
import { getKnexInstance } from './config/knex';
import './config/passport'; // Initialize passport strategies

const app: Application = express();
const PORT = config.port;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'wasm-unsafe-eval'"],           // TF.js WASM
        workerSrc: ["'self'", 'blob:'],                        // TF.js web workers
        connectSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',                          // face-api model weights
          config.cors.origin,
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],        // employee photos + canvas snapshots
        mediaSrc: ["'self'", 'blob:'],                         // webcam stream
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // needed for SharedArrayBuffer used by TF.js
  })
);
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(sessionMiddleware);

// Initialize Passport
app.use(passport.initialize());

// Serve uploaded files (photos, documents) as static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Employee Management System API',
    version: config.apiVersion,
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: `/api/${config.apiVersion}`,
    },
  });
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await database.testConnection();
    const redisHealthy = await redisClient.testConnection();

    const health = {
      status: dbHealthy && redisHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
    };

    res.status(dbHealthy && redisHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
    });
  }
});

// API routes will be added here
app.get(`/api/${config.apiVersion}`, (_req: Request, res: Response) => {
  res.json({
    message: 'Employee Management System API',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);

// File storage routes
app.use(`/api/${config.apiVersion}/files`, fileStorageRoutes);

// Email routes
app.use(`/api/${config.apiVersion}/email`, emailRoutes);

// Leave routes
const knex = getKnexInstance();
app.use(`/api/${config.apiVersion}/leaves`, createLeaveRoutes(knex));

// Payroll routes
app.use(`/api/${config.apiVersion}/payroll`, createPayrollRoutes(knex));

// Benefits routes
app.use(`/api/${config.apiVersion}/benefits`, createBenefitsRoutes(knex));

// Performance routes
app.use(`/api/${config.apiVersion}/performance`, createPerformanceRoutes(knex));

// Employee routes
app.use(`/api/${config.apiVersion}/employees`, employeeRoutes);

// Recruitment routes
app.use(`/api/${config.apiVersion}/recruitment`, recruitmentRoutes);

// Training routes
app.use(`/api/${config.apiVersion}/training`, trainingRoutes);

// Separation routes
app.use(`/api/${config.apiVersion}/separation`, separationRoutes);

// Asset routes
app.use(`/api/${config.apiVersion}/assets`, assetRoutes);

// Geo Tracking routes
app.use(`/api/${config.apiVersion}/geo`, createGeoTrackingRoutes(knex));

// Hierarchy routes
app.use(`/api/${config.apiVersion}/hierarchy`, createHierarchyRoutes(knex));

// Suppliers routes
app.use(`/api/${config.apiVersion}/suppliers`, createSuppliersRoutes(knex));

// Bank Details routes
app.use(`/api/${config.apiVersion}/bank-details`, createBankDetailsRoutes());

// Documents routes
app.use(`/api/${config.apiVersion}/documents`, createDocumentRoutes(knex));

// e-Signature routes
app.use(`/api/${config.apiVersion}/esignature`, createESignatureRoutes(knex));

// Notifications routes
app.use(`/api/${config.apiVersion}/notifications`, createNotificationRoutes(knex));

// Attendance routes
app.use(`/api/${config.apiVersion}/attendance`, attendanceRoutes);

// Dashboard routes
app.use(`/api/${config.apiVersion}/dashboard`, dashboardRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('Received shutdown signal, closing connections...');
  try {
    await database.close();
    await redisClient.close();
    console.log('All connections closed. Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    const dbConnected = await database.testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Test Redis connection
    const redisConnected = await redisClient.testConnection();
    if (!redisConnected) {
      console.warn('Warning: Redis connection failed. Session management may not work properly.');
    }

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  Employee Management System - Backend API                  ║
║  Environment: ${config.env.padEnd(44)}║
║  Port: ${PORT.toString().padEnd(51)}║
║  API Version: ${config.apiVersion.padEnd(46)}║
║  Database: ${dbConnected ? 'Connected'.padEnd(47) : 'Disconnected'.padEnd(47)}║
║  Redis: ${redisConnected ? 'Connected'.padEnd(50) : 'Disconnected'.padEnd(50)}║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
