import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@/config/env';
import { morganMiddleware } from '@/middleware/morgan.middleware';
import { errorHandler, AppError } from '@/middleware/error.middleware';
import apiRouter from '@/routes';

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morganMiddleware);
  }

  private configureRoutes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).send('Welcome to Deukhuri Digital Campus ERP API');
    });
    this.app.use('/api/v1', apiRouter);
  }

  private configureErrorHandling(): void {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(new AppError(`Endpoint ${req.method} ${req.path} not found`, 404));
    });
    this.app.use(errorHandler);
  }
}

export default new App().app;
