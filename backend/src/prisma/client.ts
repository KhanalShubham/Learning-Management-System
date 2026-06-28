import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/config/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
  });

prisma.$on('query' as never, (e) => {
  const event = e as Prisma.QueryEvent;
  logger.debug(`Query: ${event.query} - [${event.duration}ms]`);
});

prisma.$on('error' as never, (e) => {
  const event = e as Prisma.LogEvent;
  logger.error(`Prisma Error: ${event.message}`);
});

prisma.$on('info' as never, (e) => {
  const event = e as Prisma.LogEvent;
  logger.info(`Prisma Info: ${event.message}`);
});

prisma.$on('warn' as never, (e) => {
  const event = e as Prisma.LogEvent;
  logger.warn(`Prisma Warning: ${event.message}`);
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
