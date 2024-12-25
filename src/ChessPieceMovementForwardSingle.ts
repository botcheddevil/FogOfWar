import { ChessPieceColor } from './ChessPieceColor';
import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPieceMovementForwardSingle implements IChessPieceMovement {
  validateMove(from: number[], to: number[], color: ChessPieceColor): boolean {
    const direction = color === ChessPieceColor.White ? 1 : -1;
    return from[0] === to[0] - 1 * direction && from[1] === to[1];
  }
}
