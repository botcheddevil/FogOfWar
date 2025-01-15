import { ChessPiece } from './ChessPiece';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceMovementDiagonal } from './ChessPieceMovementDiagonal';
import { ChessPieceMovementDiagonalSingle } from './ChessPieceMovementDiagonalSingle';
import { ChessPieceMovementForwardDouble } from './ChessPieceMovementForwardDouble';
import { ChessPieceMovementForwardSideways } from './ChessPieceMovementForwardSideways';
import { ChessPieceMovementForwardSingle } from './ChessPieceMovementForwardSingle';
import { ChessPieceMovementForwarSidewaysSingle } from './ChessPieceMovementForwarSidewaysSingle';
import { ChessPieceMovementFowardDiagonalSingleCaptureable } from './ChessPieceMovementFowardDiagonalSingleCaptureable';
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
          new ChessPieceMovementForwardDouble(),
          new ChessPieceMovementFowardDiagonalSingleCaptureable(),
        ]);
      default:
        throw new Error('Invalid piece type');
    }
  }

  static decodePiece(encoded: number): ChessPiece | null {
    // First check if it was encoded (first bit should be 1)
    if ((encoded & (1 << 5)) === 0) {
      // Check if 6th bit is 0
      return null;
    }

    // Extract type (last 3 bits)
    const type = encoded & 0b111; // 0b111 is binary for 7

    // Extract color (shift right by 3 and subtract 2)
    const color = (encoded >> 3) - 2;

    return ChessPieceFactory.createPiece(type, color);
  }
}
