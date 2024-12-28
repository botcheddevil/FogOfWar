import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementForwardSideways implements IChessPieceMovement {
  validateMove(from: number[], to: number[]): boolean {
    return from[0] === to[0] || from[1] === to[1];
  }
}
