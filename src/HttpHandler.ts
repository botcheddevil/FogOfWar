import express, { Express, Request, Response } from 'express';
import expressWinston from 'express-winston';
import { ILogger } from './ILogger';
import winston from 'winston';

export class HttpHandler {
  private app: Express;
  private logger: ILogger;

  constructor(app: Express, logger: ILogger) {
    this.app = app;
    this.logger = logger;

    this.logger.info('HttpHandler constructor');

    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    this.app.use(express.static('public'));
    this.app.use(
      expressWinston.logger({
        level: 'http',
        winstonInstance: this.logger as winston.Logger,
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorize: true,
      }),
    );
  }

  setupRoutes() {
    this.app.get('/', (req: Request, res: Response) => {
      res.send('Hello, World!');
    });
  }
}
