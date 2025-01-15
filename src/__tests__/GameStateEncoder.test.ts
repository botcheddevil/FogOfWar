import { GameStateEncoder } from '../GameStateEncoder';
import { ChessPieceColor } from '../ChessPieceColor';
import { ChessPieceType } from '../ChessPieceType';
import { GameResult } from '../types';

describe('GameStateEncoder', () => {
  it('should correctly encode and decode all game states', () => {
    const testCases = [
      {
        zeroPieceColor: ChessPieceColor.Black,
        zeroPieceType: ChessPieceType.King,
        turnOfPlayer: false,
        gameStatus: GameResult.WAITING,
      },
      {
        zeroPieceColor: ChessPieceColor.White,
        zeroPieceType: ChessPieceType.Queen,
        turnOfPlayer: true,
        gameStatus: GameResult.WHITE_WINS,
      },
      {
        zeroPieceColor: ChessPieceColor.Black,
        zeroPieceType: ChessPieceType.None,
        turnOfPlayer: false,
        gameStatus: GameResult.BLACK_WINS,
      },
    ];

    for (const testCase of testCases) {
      const encoded = GameStateEncoder.encode(
        testCase.zeroPieceColor,
        testCase.zeroPieceType,
        testCase.turnOfPlayer,
        testCase.gameStatus,
      );

      const decoded = GameStateEncoder.decode(encoded);
      expect(decoded).toEqual(testCase);
    }
  });

  it('should handle edge cases', () => {
    const encoded = GameStateEncoder.encode(
      ChessPieceColor.Black,
      ChessPieceType.None,
      true,
      GameResult.DRAW,
    );

    const decoded = GameStateEncoder.decode(encoded);

    expect(decoded.zeroPieceColor).toBe(ChessPieceColor.Black);
    expect(decoded.zeroPieceType).toBe(ChessPieceType.None);
    expect(decoded.turnOfPlayer).toBe(true);
    expect(decoded.gameStatus).toBe(GameResult.DRAW);
  });
});
