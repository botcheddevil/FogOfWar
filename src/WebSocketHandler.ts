import { Server } from 'http';
import { ILogger } from './ILogger';
import WebSocket from 'ws';

export class WebSocketHandler {
  private logger: ILogger;
  private wss: WebSocket.Server;

  constructor(server: Server, logger: ILogger) {
    this.logger = logger;
    this.wss = new WebSocket.Server({ server: server });
    this.logger.info('WebSocketHandler constructor');
    this.setup();
  }

  private setup() {
    this.logger.info('WebSocketHandler setup');
    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });
  }

  private handleConnection(ws: WebSocket) {
    this.logger.info('WebSocketHandler handleConnection');
    ws.on('message', (message: Buffer) => {
      this.handleMessage(message, ws);
    });
  }

  private handleMessage(message: Buffer, ws: WebSocket) {
    this.logger.info('WebSocketHandler handleMessage');
    this.logger.info(`Received message => ${message}`);
    ws.send(message);
  }

  close() {
    this.logger.info('WebSocketHandler close');
    this.wss.close();
  }
}
