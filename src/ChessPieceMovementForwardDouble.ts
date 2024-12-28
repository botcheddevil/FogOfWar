import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementForwardDouble implements IChessPieceMovement {
  validateMove(from: number[], to: number[], direction: number): boolean {
    if (
      (from[0] === 1 && direction === 1) ||
      (from[0] === 6 && direction === -1)
    ) {
      return from[0] === to[0] - 2 * direction && from[1] === to[1];
    }
    return false;
  }
}
