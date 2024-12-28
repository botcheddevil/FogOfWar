import { mockLogger } from './mocks';
import { ChessBoardFactory } from '../ChessBoardFactory';
import { ChessPieceFactory } from '../ChessPieceFactory';
import { ChessBoard } from '../ChessBoard';
import { ChessPieceType } from '../ChessPieceType';
import { ChessPieceColor } from '../ChessPieceColor';
describe('ChessBoard', () => {
  it('Create standard board', () => {
    const chessBoard = ChessBoardFactory.createBoard(mockLogger);
    expect(chessBoard).toBeDefined();
    const binary = chessBoard.toBinary();
    expect(Array.from(binary).length).toBe(25);
    expect(Array.from(binary)).toStrictEqual([
      32, 146, 139, 48, 211, 143, 0, 112, 70, 8, 80, 196, 195, 28, 179, 211, 93,
      183, 227, 254, 126, 235, 222, 252, 2,
    ]);
  });

  it('Create board for a single piece on board', () => {
    const board = [
      [
        null,
        null,
        ChessPieceFactory.createPiece(
          ChessPieceType.Bishop,
          ChessPieceColor.White,
        ),
        null,
        null,
        null,
        null,
        null,
      ],
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
    ];
    const chessBoard = new ChessBoard(board, mockLogger);
    const binary = chessBoard.toBinary();
    expect(binary).toBeDefined();
    expect(Array.from(binary).length).toBe(24);
    expect(Array.from(binary)).toStrictEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it('Create board for a single piece on board on zeroth location', () => {
    const board = [
      [
        ChessPieceFactory.createPiece(
          ChessPieceType.Bishop,
          ChessPieceColor.White,
        ),
        null,
        ChessPieceFactory.createPiece(
          ChessPieceType.Bishop,
          ChessPieceColor.White,
        ),
        null,
        null,
        null,
        null,
        null,
      ],
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
    ];
    const chessBoard = new ChessBoard(board, mockLogger);
    const binary = chessBoard.toBinary();
    expect(binary).toBeDefined();
    expect(Array.from(binary).length).toBe(24);
    expect(Array.from(binary)).toStrictEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });
});
