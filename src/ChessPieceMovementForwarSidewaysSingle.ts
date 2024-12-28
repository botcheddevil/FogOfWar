import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementForwarSidewaysSingle
  implements IChessPieceMovement
{
  validateMove(from: number[], to: number[]): boolean {
    return (
      (from[0] === to[0] && Math.abs(from[1] - to[1]) === 1) ||
      (from[1] === to[1] && Math.abs(from[0] - to[0]) === 1)
    );
  }
}
