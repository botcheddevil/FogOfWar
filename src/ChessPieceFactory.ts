import { ChessPiece } from './ChessPiece';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceMovementDiagonal } from './ChessPieceMovementDiagonal';
import { ChessPieceMovementDiagonalSingle } from './ChessPieceMovementDiagonalSingle';
import { ChessPieceMovementForwardSideways } from './ChessPieceMovementForwardSideways';
import { ChessPieceMovementForwardSingle } from './ChessPieceMovementForwardSingle';
import { ChessPieceMovementForwarSidewaysSingle } from './ChessPieceMovementForwarSidewaysSingle';
import { ChessPieceMovementTwoAndHalf } from './ChessPieceMovementTwoAndHalf';
import { ChessPieceType } from './ChessPieceType';

export class ChessPieceFactory {
  static createPiece(type: ChessPieceType, color: ChessPieceColor): ChessPiece {
    switch (type) {
      case ChessPieceType.Rook:
        return new ChessPiece(ChessPieceType.Rook, color, [
          new ChessPieceMovementForwardSideways(),
        ]);
      case ChessPieceType.Knight:
        return new ChessPiece(ChessPieceType.Knight, color, [
          new ChessPieceMovementTwoAndHalf(),
        ]);
      case ChessPieceType.Bishop:
        return new ChessPiece(ChessPieceType.Bishop, color, [
          new ChessPieceMovementDiagonal(),
        ]);
      case ChessPieceType.King:
        return new ChessPiece(ChessPieceType.King, color, [
          new ChessPieceMovementDiagonalSingle(),
          new ChessPieceMovementForwarSidewaysSingle(),
        ]);
      case ChessPieceType.Queen:
        return new ChessPiece(ChessPieceType.Queen, color, [
          new ChessPieceMovementDiagonal(),
          new ChessPieceMovementForwardSideways(),
        ]);
      case ChessPieceType.Pawn:
        return new ChessPiece(ChessPieceType.Pawn, color, [
          new ChessPieceMovementForwardSingle(),
        ]);
      default:
        throw new Error('Invalid piece type');
    }
  }
}
