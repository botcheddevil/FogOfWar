import { Game, GameStatus, GameResult, Move } from './types';

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
  validateSession(sessionId: string, gameId: string): Promise<boolean>;
  deleteSession(sessionId: string): Promise<boolean>;

  // Game Management
  createGame(
    playerWhite: string,
    playerBlack: string,
    initialState: Uint8Array,
  ): Promise<string>;
  getGameState(
    gameId: string,
  ): Promise<{ game: Game; state: Uint8Array } | null>;
  updateGameState(
    gameId: string,
    newState: Uint8Array,
    move: Move,
    status?: GameStatus,
    finalResult?: GameResult,
  ): Promise<boolean>;
  getGameList(
    email: string,
    status?: GameStatus[],
    page?: number,
    limit?: number,
  ): Promise<{ games: Game[]; total: number }>;
  getGame(gameId: string): Promise<Game | null>;
  joinGame(gameId: string, playerBlack: string): Promise<boolean>;
}
