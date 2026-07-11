import app from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { prisma } from '@/prisma/client';
import http from 'http';

const server = http.createServer(app);

const startServer = async () => {
  try {
    try {
      logger.info('Connecting to PostgreSQL database via Prisma...');
      await prisma.$connect();
      logger.info('Database connection established successfully.');
      
      // Initialize/Seed default document templates
      try {
        const { DocumentService } = await import('@/modules/documents/document.service');
        const documentService = new DocumentService();
        await documentService.initializeDefaultTemplates();
      } catch (seedError) {
        logger.error('Failed to initialize default templates on startup:', seedError);
      }
    } catch (dbError) {
      logger.warn('⚠️ Could not connect to the database. Server is running but database operations will fail.');
      logger.warn(dbError instanceof Error ? dbError.message : String(dbError));
    }

    if (!process.env.VERCEL) {
      server.listen(env.PORT, () => {
        logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      });
    }
  } catch (error) {
    logger.error('Failed to start server:');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database client disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

export default app;
