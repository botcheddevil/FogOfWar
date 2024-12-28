import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementFowardDiagonalSingleCaptureable
  implements IChessPieceMovement
{
  validateMove(
    from: number[],
    to: number[],
    direction: number,
    toCaptureable: boolean,
  ): boolean {
    return (
      toCaptureable &&
      (to[0] - from[0]) * direction === 1 &&
      Math.abs(to[1] - from[1]) === 1
    );
  }
}
