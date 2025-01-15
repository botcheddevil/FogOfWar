import { Server } from 'http';
import { ILogger } from './ILogger';
import WebSocket from 'ws';
import { IDb } from './IDb';
import { Game, Session } from './types';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessBoard } from './ChessBoard';

export class WebSocketHandler {
  private logger: ILogger;
  private wss: WebSocket.Server;
  private db: IDb;
  private gameMap: Map<string, Array<WebSocket>> = new Map();
  private sessionMap: Map<WebSocket, { gameId: string; session: Session }> =
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
        this.handleMessageMove(message, ws);
        break;
      case 32:
        this.handleMessageJoin(message, ws);
        break;
      default:
        this.logger.error('Invalid message length');
    }
  }

  private async handleMessageMove(message: Buffer, ws: WebSocket) {
    const start = message[0];
    const end = message[1];

    // Load the session data
    const sessionData = this.sessionMap.get(ws);
    if (!sessionData) {
      this.logger.error('Session not found');
      ws.close();
      return;
    }

    // Load the game state
    const game = await this.db.getGame(sessionData.gameId);
    if (!game) {
      this.logger.error('Failed to get game state');
      ws.close();
      return;
    }
    const chessBoard = new ChessBoard(
      game.moves,
      game.positions,
      game.result,
      this.logger,
    );

    // Move the piece
    const playerColor =
      game.playerWhite === sessionData.session.email
        ? ChessPieceColor.White
        : ChessPieceColor.Black;
    const move = chessBoard.movePiece(playerColor, start, end);
    if (!move) {
      this.logger.warn('Invalid move');
      ws.send(chessBoard.toBinary());
      return;
    }

    // Update the game state
    const gameResult = chessBoard.getResult();
    this.db.updateGame(
      sessionData.gameId,
      chessBoard.getPositions(),
      move,
      gameResult,
    );

    this.logger.info('Game Result', { gameResult });
    this.logger.info('Move', { move });
    this.logger.info('Positions', { positions: chessBoard.getPositions() });

    // Send the updated game state to all players
    // - Send the binary representation to all players
    this.gameMap.get(sessionData.gameId)?.forEach((socket) => {
      if (socket === ws) {
        return;
      }
      socket.send(chessBoard.toBinary());
    });
  }

  private async handleMessageJoin(message: Buffer, ws: WebSocket) {
    const { gameId, sessionId } = this.unpackBytes(message);
    this.logger.info(`gameId: ${gameId} sessionId: ${sessionId}`);
    const session = await this.db.validateSession(sessionId, gameId);
    if (!session) {
      this.logger.warn(
        `Invalid Session -- GameId: ${gameId} SessionId: ${sessionId}`,
      );
      ws.close();
      return;
    }
    // Store the WebSocket connection
    this.sessionMap.set(ws, { gameId, session });

    // Store the game map
    const sockets = this.gameMap.get(gameId) || [];
    sockets.push(ws);
    this.gameMap.set(gameId, sockets);

    // Send game state to the player
    const game = await this.db.getGame(gameId);
    if (!game) {
      this.logger.error('Failed to get game state');
      return;
    }
    this.logger.info('Sending game state to player', { game });
    // Send letter w or b as Uint8Array
    ws.send(new Uint8Array([game.playerWhite === session.email ? 119 : 98]));
    // Prefix opponent email with `o` and send it as Uint8Array
    const opponent = this.getOpponentEmail(game, session.email);
    this.logger.info('Sending opponent email to player', { opponent });
    ws.send(new Uint8Array([111, ...Buffer.from(opponent)]));

    const turnOfPlayer =
      game.moves.length % 2 === 0 && game.playerWhite === session.email;

    this.logger.info('Turn Of Player', { turnOfPlayer });

    const chessBoard = new ChessBoard(
      game.moves,
      game.positions,
      game.result,
      this.logger,
    );
    ws.send(chessBoard.toBinary(turnOfPlayer));
  }

  private getOpponentEmail(game: Game, email: string): string {
    return game.playerWhite === email ? game.playerBlack : game.playerWhite;
  }

  private bytesToUuid(bytes: Uint8Array, offset: number = 0): string {
    const hex = Array.from(bytes.slice(offset, offset + 16))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  private unpackBytes(bytes: Uint8Array): {
    gameId: string;
    sessionId: string;
  } {
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
