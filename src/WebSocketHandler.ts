import { Server } from 'http';
import { ILogger } from './ILogger';
import WebSocket from 'ws';
import { IDb } from './IDb';
import { ChessBoardFactory } from './ChessBoardFactory';

export class WebSocketHandler {
  private logger: ILogger;
  private wss: WebSocket.Server;
  private db: IDb;
  private gameMap: Map<string, Array<WebSocket>> = new Map();
  private sessionMap: Map<WebSocket, { gameId: string; sessionId: string }> =
    new Map();

  constructor(server: Server, db: IDb, logger: ILogger) {
    this.logger = logger;
    this.db = db;
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

  private async handleMessage(message: Buffer, ws: WebSocket) {
    this.logger.info('WebSocketHandler handleMessage');
    this.logger.info(`Received message => ${message} ${message.length}`);
    switch (message.length) {
      case 2:
        this.logger.info('Received 2 bytes');
        // Movement of piece
        const start = message[0];
        const end = message[1];
        this.logger.info(`Start: ${start} End: ${end}`);
        const sessionData = this.sessionMap.get(ws);
        if (!sessionData) {
          this.logger.error('Session not found');
          return;
        }
        const moveGameState = await this.db.getGameState(sessionData.gameId);
        if (!moveGameState) {
          this.logger.error('Failed to get game state');
          return;
        }
        const chessBoard = ChessBoardFactory.createBoardFromUInt6Array(
          moveGameState.state,
          this.logger,
        );
        const from = [Math.floor(start / 8), start % 8];
        const to = [Math.floor(end / 8), end % 8];
        this.logger.info(`From: ${from} To: ${to}`);
        const moveResult = chessBoard.movePiece(from, to);
        const binary = chessBoard.toBinary();
        console.log('Saving state', binary);
        this.db.updateGameState(sessionData.gameId, binary, {
          start,
          end,
          timestamp: new Date(),
        });

        this.gameMap.get(sessionData.gameId)?.forEach((socket) => {
          socket.send(binary);
        });
        if (!moveResult) {
          this.logger.warn('Invalid move');
          return;
        }
        break;
      case 32:
        const { gameId, sessionId } = this.unpackBytes(message);
        this.logger.info(`gameId: ${gameId} sessionId: ${sessionId}`);
        const result = await this.db.validateSession(sessionId, gameId);
        if (!result) {
          this.logger.warn(
            `Invalid Session -- GameId: ${gameId} SessionId: ${sessionId}`,
          );
          // Send `i` as Uint8Array
          const invalidSession = new Uint8Array([105]);
          ws.send(invalidSession);
          ws.close();
          return;
        }
        // Store the WebSocket connection
        this.sessionMap.set(ws, { gameId, sessionId });

        // Store the game map
        const sockets = this.gameMap.get(gameId) || [];
        sockets.push(ws);
        this.gameMap.set(gameId, sockets);

        // Send game state to the player
        const gameState = await this.db.getGameState(gameId);
        if (!gameState) {
          this.logger.error('Failed to get game state');
          return;
        }
        this.logger.info('Sending game state to player', { gameState });
        ws.send(gameState.state);
        break;
      default:
        this.logger.error('Invalid message length');
    }
  }

  bytesToUuid(bytes: Uint8Array, offset: number = 0): string {
    const hex = Array.from(bytes.slice(offset, offset + 16))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  unpackBytes(bytes: Uint8Array): { gameId: string; sessionId: string } {
    return {
      gameId: this.bytesToUuid(bytes, 0),
      sessionId: this.bytesToUuid(bytes, 16),
    };
  }

  close() {
    this.logger.info('WebSocketHandler close');
    this.wss.close();
  }
}
