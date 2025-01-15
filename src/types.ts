import { Binary, ObjectId } from 'mongodb';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceType } from './ChessPieceType';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  joinedDate: Date;
}

export interface Move {
  start: number;
  end: number;
  pieceColor: ChessPieceColor;
  pieceType: ChessPieceType;
  timestamp: Date;
}

export enum GameResult {
  WAITING = 0,
  ONGOING = 1,
  ABANDONED = 2,
  DRAW = 3,
  BLACK_WINS = 4,
  WHITE_WINS = 5,
}

export interface Game {
  _id?: ObjectId;
  uuid: string;
  playerWhite: string;
  playerBlack: string;
  createdDate: Date;
  moves: Move[];
  positions: Array<number | null>;
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
