import dotenv from 'dotenv';
import express from 'express';
import { LoggerFactory } from './LoggerFactory';
import { HttpHandler } from './HttpHandler';
import { WebSocketHandler } from './WebSocketHandler';
import http from 'http';
import { Db } from './Db';

dotenv.config();

async function main() {
  const logger = await LoggerFactory.getLogger();
  const app = express();
  const port = 3000;

  const server = http.createServer(app);
  const dbOptions = {
    directConnection: true,
    auth: {
      username: 'root',
      password: 'your-password-here',
    },
  };
  const db = new Db(
    process.env.MONGO_URI || 'mongodb://192.168.29.169:27017',
    dbOptions,
    logger,
  );
  await db.connect();

  new HttpHandler(app, db, logger);
  new WebSocketHandler(server, db, logger);

  server.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
  });

  logger.info('Fog Of War is running!');
}

main();
