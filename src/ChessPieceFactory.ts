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

  static decodePiece(byte: number): ChessPiece {
    const color = (byte >> 3) & 1; // Shift right 3 and mask with 1 to get color
    const type = byte & 0b111; // Mask with 111 to get type (3 bits)
    return ChessPieceFactory.createPiece(type, color);
  }
}
