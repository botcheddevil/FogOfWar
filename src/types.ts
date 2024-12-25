import { Binary, ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  joinedDate: Date;
}

export interface Move {
  from: number;
  to: number;
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
  playerWhite: string; // email
  playerBlack: string; // email
  createdDate: Date;
  moves: Move[];
  gameState: Binary;
  status: GameStatus;
  result: GameResult;
}
