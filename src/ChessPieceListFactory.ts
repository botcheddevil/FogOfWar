import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceFactory } from './ChessPieceFactory';
import { ChessPieceType } from './ChessPieceType';

export class ChessPieceListFactory {
  static createPieceListNobelity(color: ChessPieceColor) {
    return [
      ChessPieceFactory.createPiece(ChessPieceType.Rook, color),
      ChessPieceFactory.createPiece(ChessPieceType.Knight, color),
      ChessPieceFactory.createPiece(ChessPieceType.Bishop, color),
      ChessPieceFactory.createPiece(ChessPieceType.King, color),
      ChessPieceFactory.createPiece(ChessPieceType.Queen, color),
      ChessPieceFactory.createPiece(ChessPieceType.Bishop, color),
      ChessPieceFactory.createPiece(ChessPieceType.Knight, color),
      ChessPieceFactory.createPiece(ChessPieceType.Rook, color),
    ];
  }

  static createPieceListPeasantry(color: ChessPieceColor) {
    return Array(8).fill(
      ChessPieceFactory.createPiece(ChessPieceType.Pawn, color),
    );
  }
}
