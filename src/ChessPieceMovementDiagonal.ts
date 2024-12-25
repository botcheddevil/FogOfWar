import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementDiagonal implements IChessPieceMovement {
  validateMove(from: number[], to: number[]): boolean {
    return Math.abs(from[0] - to[0]) === Math.abs(from[1] - to[1]);
  }
}
