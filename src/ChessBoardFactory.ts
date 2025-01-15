import { ChessBoard } from './ChessBoard';
import { ILogger } from './ILogger';
import { GameResult } from './types';

export class ChessBoardFactory {
  static createBoard(logger: ILogger): ChessBoard {
    const positions = [
      8, 9, 10, 11, 12, 13, 14, 15, 0, 7, 1, 6, 2, 5, 3, 4, 48, 49, 50, 51, 52,
      53, 54, 55, 56, 63, 57, 62, 58, 61, 59, 60,
    ];
    return new ChessBoard([], positions, GameResult.WAITING, logger);
  }
}
