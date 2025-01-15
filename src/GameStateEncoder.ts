import { GameResult } from './types';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceType } from './ChessPieceType';

export class GameStateEncoder {
  static encode(
    zeroPieceColor: ChessPieceColor,
    zeroPieceType: ChessPieceType,
    turnOfPlayer: boolean,
    gameStatus: GameResult,
  ): Uint8Array {
    let byte = 0;

    // Set zero piece color (bit 0)
    byte |= zeroPieceColor ? 1 : 0;

    // Set zero piece type (bits 1-3)
    byte |= (zeroPieceType & 0b111) << 1;

    // Set turn of player (bit 4)
    byte |= (turnOfPlayer ? 1 : 0) << 4;

    // Set game status (bits 5-7)
    byte |= (gameStatus & 0b111) << 5;

    return new Uint8Array([byte]);
  }

  static decode(data: Uint8Array): {
    zeroPieceColor: ChessPieceColor;
    zeroPieceType: ChessPieceType;
    turnOfPlayer: boolean;
    gameStatus: GameResult;
  } {
    const byte = data[0];

    return {
      zeroPieceColor: byte & 0b1,
      zeroPieceType: (byte >> 1) & 0b111,
      turnOfPlayer: ((byte >> 4) & 0b1) === 1,
      gameStatus: (byte >> 5) & 0b111,
    };
  }
}
