import { ChessPieceColor } from './ChessPieceColor';

export interface IChessPieceMovement {
  validateMove(from: number[], to: number[], color?: ChessPieceColor): boolean;
}
