import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementDiagonalSingle implements IChessPieceMovement {
  validateMove(from: number[], to: number[]): boolean {
    return (Math.abs(from[0] - to[0]) === 1 && Math.abs(from[1] - to[1])) === 1;
  }
}
