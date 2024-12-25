import winston from 'winston';
import { ILogger } from './ILogger';

export class LoggerFactory {
  static async getLogger(): Promise<ILogger> {
    const logger = await winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
      transports: [new winston.transports.Console()],
    });
    return logger as ILogger;
  }
}
