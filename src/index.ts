import dotenv from 'dotenv';
import express from 'express';
import { LoggerFactory } from './LoggerFactory';
import { HttpHandler } from './HttpHandler';
import { WebSocketHandler } from './WebSocketHandler';
import http from 'http';

dotenv.config();

async function main() {
  const logger = await LoggerFactory.getLogger();
  const app = express();
  const port = 3000;

  const server = http.createServer(app);

  new HttpHandler(app, logger);
  new WebSocketHandler(server, logger);

  server.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
  });

  logger.info('TypeScript project is running!');
}

main();
