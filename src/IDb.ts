import { Game, GameResult, Move, Session } from './types';

export interface IDb {
  connect(): Promise<void>;
  close(): Promise<void>;

  // User Management
  createUser(email: string, password: string): Promise<string>;
  validateCredentials(
    email: string,
    password: string,
  ): Promise<{
    valid: boolean;
    sessionId?: string;
  }>;

  // Session Management
  validateUserSession(sessionId: string, email: string): Promise<string | null>;
  validateSession(sessionId: string, gameId: string): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<boolean>;

  // Game Management
  createGame(
    playerWhite: string,
    playerBlack: string,
    positions: Array<number | null>,
  ): Promise<string>;
  updateGame(
    gameId: string,
    positions: (number | null)[],
    move: Move,
    gameResult: GameResult,
  ): Promise<boolean>;
  getGameList(
    email: string,
    page?: number,
    limit?: number,
  ): Promise<{ games: Game[]; total: number }>;
  getGame(gameId: string): Promise<Game | null>;
  joinGame(gameId: string, playerBlack: string): Promise<boolean>;
}
