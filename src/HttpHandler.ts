import express, { Express, Request, Response, NextFunction } from 'express';
import expressWinston from 'express-winston';
import { ILogger } from './ILogger';
import { Db } from './Db';
import winston from 'winston';
import { ChessBoardFactory } from './ChessBoardFactory';

export class HttpHandler {
  private app: Express;
  private logger: ILogger;
  private db: Db;

  constructor(app: Express, db: Db, logger: ILogger) {
    this.app = app;
    this.logger = logger;
    this.db = db;

    this.logger.info('HttpHandler constructor');

    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    this.app.use(express.json());
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
    this.app.post(
      '/new-game',
      this.auth.bind(this),
      this.handleNewGame.bind(this),
    );

    this.app.post(
      '/join-game',
      this.auth.bind(this),
      this.handleJoinGame.bind(this),
    );

    this.app.get('/games', this.auth.bind(this), async (req, res) => {
      const username = req.headers['username'] as string;
      const { games, total } = await this.db.getGameList(username);

      res.json({
        success: true,
        games,
        total,
      });
    });

    this.app.post('/login', this.handleLogin.bind(this));

    this.app.post('/register', this.handleRegister.bind(this));

    this.app.post(
      '/logout',
      this.auth.bind(this),
      this.handleLogout.bind(this),
    );
  }

  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sessionId = req.headers['session-id'] as string;
    const username = req.headers['username'] as string;

    if (!sessionId || !username) {
      res.status(401).json({
        success: false,
        error: 'Missing authentication credentials',
      });
      return;
    }

    try {
      const isValid = await this.db.validateUserSession(sessionId, username);
      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired session',
        });
        return;
      }

      next();
    } catch (error) {
      this.logger.error('Session validation error:', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
    return;
  }

  async handleNewGame(req: Request, res: Response): Promise<void> {
    try {
      const username = req.headers['username'] as string; // We know this exists because of middleware

      // Create initial game state (example)
      const board = ChessBoardFactory.createBoard(this.logger);

      // Create new game in database
      const gameId = await this.db.createGame(
        username, // White player
        '', // Black player
        board.getPositions(),
      );

      res.json({
        success: true,
        gameId,
        message: 'Game created successfully',
      });
    } catch (error) {
      console.error('Failed to create new game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create game',
      });
    }
    return;
  }

  async handleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      this.logger.info(`Login attempt for ${username}`);
      const { valid, sessionId } = await this.db.validateCredentials(
        username,
        password,
      );
      if (valid) {
        res.send({ success: true, sessionId });
        return;
      }
      this.logger.warn(`Login attempt failed for ${username}`);
      res.status(401).send({ success: false, error: 'Invalid credentials' });
    } catch (error) {
      this.logger.error('Failed to login:', {
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      res.status(500).send({ success: false, error: 'Internal server error' });
    }
  }

  async handleLogout(req: Request, res: Response): Promise<void> {
    const sessionId = req.headers['session-id'] as string;

    try {
      await this.db.deleteSession(sessionId);
      res.send({ success: true });
    } catch (error) {
      this.logger.error('Failed to logout:', {
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      res.status(500).send({ success: false, error: 'Internal server error' });
    }
  }

  async handleRegister(req: Request, res: Response): Promise<void> {
    const username = req.body.username;
    const password = req.body.password;

    //Check if username is valid email using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      res.status(400).send({ success: false, error: 'Invalid email' });
      return;
    }

    this.logger.info(`Register attempt for ${username}`);
    try {
      const userId = await this.db.createUser(username, password);
      res.send({ success: true, userId });
    } catch (error) {
      res.status(400).send({ success: false, error: (error as Error).message });
    }
  }

  async handleJoinGame(req: Request, res: Response): Promise<void> {
    try {
      const username = req.headers['username'] as string; // We know this exists because of middleware
      const gameId = req.body.gameId;

      this.logger.info(`Join game attempt for ${username} in game ${gameId}`);

      const game = await this.db.getGame(gameId);
      if (!game) {
        res.status(404).json({
          success: false,
          error: 'Game not found',
        });
        return;
      }

      if (game.playerWhite === username) {
        res.status(400).json({
          success: false,
          error: `Already joined as white player.`,
        });
        return;
      }

      if (game.playerBlack !== '' && game.playerBlack !== username) {
        res.status(400).json({
          success: false,
          error: `Game already has two players ${game.playerBlack} ${username}`,
        });
        return;
      }

      const result = await this.db.joinGame(gameId, username);

      if (!result) {
        res.status(400).json({
          success: false,
          error: 'Failed to join game',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Game joined successfully',
      });

      return;
    } catch (error) {
      console.error('Failed to join game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join game',
      });
    }
  }
}
