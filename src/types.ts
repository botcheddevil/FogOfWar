import { Binary, ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  joinedDate: Date;
}

export interface Move {
  start: number;
  end: number;
  timestamp: Date;
}

export enum GameStatus {
  NEW = 'new',
  IN_PROGRESS = 'in-progress',
  COMPLETE = 'complete',
}

export enum GameResult {
  ONGOING = 'ongoing',
  ABANDONED = 'abandoned',
  DRAW = 'draw',
  WHITE_WINS = 'white-wins',
  BLACK_WINS = 'black-wins',
}

export interface Game {
  _id?: ObjectId;
  udid: string;
  playerWhite: string;
  playerBlack: string;
  createdDate: Date;
  moves: Move[];
  gameState: Binary;
  status: GameStatus;
  result: GameResult;
}

export interface Session {
  _id?: ObjectId;
  userId: string;
  sessionId: string;
  email: string;
  createdAt: Date;
  lastActive: Date;
}
