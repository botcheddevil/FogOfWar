import { mockLogger } from './mocks';
import { ChessBoardFactory } from '../ChessBoardFactory';
import { ChessBoard } from '../ChessBoard';
import { GameResult } from '../types';
describe('ChessBoard', () => {
  it('Create standard board', () => {
    const chessBoard = ChessBoardFactory.createBoard(mockLogger);
    expect(chessBoard).toBeDefined();
    const binary = chessBoard.toBinary();
    expect(Array.from(binary).length).toBe(25);
    expect(Array.from(binary)).toStrictEqual([
      72, 162, 44, 76, 227, 60, 192, 17, 24, 66, 49, 16, 112, 44, 207, 116, 109,
      223, 248, 159, 251, 122, 191, 243, 20,
    ]);
  });

  it('Create board for a single piece on board', () => {
    const positions: Array<number | null> = Array(32).fill(null);
    positions[13] = 2;
    const chessBoard = new ChessBoard(
      [],
      positions,
      GameResult.WAITING,
      mockLogger,
    );
    const binary = chessBoard.toBinary();
    expect(binary).toBeDefined();
    expect(Array.from(binary).length).toBe(25);
    expect(Array.from(binary)).toStrictEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      30,
    ]);
  });

  it('Create board for a single piece on board on zeroth location', () => {
    const positions: Array<number | null> = Array(32).fill(null);
    positions[12] = 2;
    positions[13] = 0;
    const chessBoard = new ChessBoard(
      [],
      positions,
      GameResult.WAITING,
      mockLogger,
    );
    const binary = chessBoard.toBinary();
    expect(binary).toBeDefined();
    expect(Array.from(binary).length).toBe(25);
    expect(Array.from(binary)).toStrictEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      22,
    ]);
  });
});
