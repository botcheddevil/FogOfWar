import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementTwoAndHalf implements IChessPieceMovement {
  validateMove(from: number[], to: number[]): boolean {
    const verticalMovement: boolean =
      Math.abs(from[0] - to[0]) === 2 && Math.abs(from[1] - to[1]) === 1;
    const horizontalMovement: boolean =
      Math.abs(from[0] - to[0]) === 1 && Math.abs(from[1] - to[1]) === 2;
    return verticalMovement || horizontalMovement;
  }
}
