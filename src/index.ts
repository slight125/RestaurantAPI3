import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  });
}

export default app;

