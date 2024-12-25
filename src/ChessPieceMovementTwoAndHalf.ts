import { ChessPieceColor } from './ChessPieceColor';
import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementTwoAndHalf implements IChessPieceMovement {
  validateMove(from: number[], to: number[], _color: ChessPieceColor): boolean {
    return Math.abs(from[0] - to[0]) === 2 && Math.abs(from[1] - to[1]) === 1;
  }
}
