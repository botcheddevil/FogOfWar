import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceType } from './ChessPieceType';
import { IChessPieceMovement } from './IChessPieceMovement';

export class ChessPiece {
  private type: ChessPieceType;
  private color: ChessPieceColor;
  private validMovements: IChessPieceMovement[] = [];

  constructor(
    type: ChessPieceType,
    color: ChessPieceColor,
    validMovements: IChessPieceMovement[],
  ) {
    this.type = type;
    this.color = color;
    this.validMovements = validMovements;
  }

  getColor(): ChessPieceColor {
    return this.color;
  }

  getType(): ChessPieceType {
    return this.type;
  }

  getValidMoves(): IChessPieceMovement[] {
    return this.validMovements;
  }

  encodePiece(): number {
    return (this.color << 3) | this.type; // Shift color left by 3 bits and combine with type
  }
}
