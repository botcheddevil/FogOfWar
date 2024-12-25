import { ChessBoard } from './ChessBoard';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceFactory } from './ChessPieceFactory';
import { ChessPieceListFactory } from './ChessPieceListFactory';
import { ChessPieceType } from './ChessPieceType';

export class ChessBoardFactory {
  static createBoardFromUInt8Array(board: Uint8Array): ChessBoard {
    const boardArray = new Array(8).fill(null).map(() => Array(8).fill(null));
    const sequence: Array<ChessPieceType> = [
      ChessPieceType.Pawn,
      ChessPieceType.Pawn,
      ChessPieceType.Pawn,
      ChessPieceType.Pawn,
      ChessPieceType.Pawn,
      ChessPieceType.Pawn,
      ChessPieceType.Pawn,
      ChessPieceType.Pawn,
      ChessPieceType.Rook,
      ChessPieceType.Rook,
      ChessPieceType.Knight,
      ChessPieceType.Knight,
      ChessPieceType.Bishop,
      ChessPieceType.Bishop,
      ChessPieceType.King,
      ChessPieceType.Queen,
    ];

    for (let i = 0; i < 32; i++) {
      const row = Math.floor(board[i] / 8);
      const col = board[i] % 8;
      const pieceType: ChessPieceType = sequence[i % 16];
      const color = i < 16 ? ChessPieceColor.White : ChessPieceColor.Black;

      boardArray[row][col] = ChessPieceFactory.createPiece(pieceType, color);
    }

    return new ChessBoard(boardArray);
  }

  static createBoard(): ChessBoard {
    const board = [
      ChessPieceListFactory.createPieceListNobelity(ChessPieceColor.White),
      ChessPieceListFactory.createPieceListPeasantry(ChessPieceColor.White),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      ChessPieceListFactory.createPieceListPeasantry(ChessPieceColor.Black),
      ChessPieceListFactory.createPieceListNobelity(ChessPieceColor.Black),
    ];
    return new ChessBoard(board);
  }
}
