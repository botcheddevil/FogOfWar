import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementForwardSingle implements IChessPieceMovement {
  validateMove(from: number[], to: number[], direction: number): boolean {
    return from[0] === to[0] - 1 * direction && from[1] === to[1];
  }
}
