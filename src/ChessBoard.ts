import { ChessPiece } from './ChessPiece';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceType } from './ChessPieceType';

export class ChessBoard {
  private board: (ChessPiece | null)[][];

  constructor(board: ChessPiece[][]) {
    this.board = board;
  }

  movePiece(from: number[], to: number[]): boolean {
    if (!this.validateMove(from, to)) {
      return false;
    }

    if (this.hasObstruction(from, to)) {
      return false;
    }

    if (!this.isPieceCapturable(from, to)) {
      return false;
    }

    this.board[to[0]][to[1]] = this.board[from[0]][from[1]];
    this.board[from[0]][from[1]] = null;
    return true;
  }

  hasObstruction(from: number[], to: number[]): boolean {
    // Get all the squares between from and to
    let row = from[0];
    let col = from[1];
    while (row !== to[0] && col !== to[1]) {
      row += row < to[0] ? 1 : -1;
      col += col < to[1] ? 1 : -1;
      if (this.board[row][col] !== null && row !== to[0] && col !== to[1]) {
        return true;
      }
    }

    while (row !== to[0]) {
      row += row < to[0] ? 1 : -1;
      if (this.board[row][col] !== null && row !== to[0]) {
        return true;
      }
    }

    while (col !== to[1]) {
      col += col < to[1] ? 1 : -1;
      if (this.board[row][col] !== null && col !== to[1]) {
        return true;
      }
    }

    return false;
  }

  isPieceCapturable(from: number[], to: number[]): boolean {
    const piece = this.board[to[0]][to[1]];
    if (!piece) {
      return true;
    }
    return piece.getColor() !== this.board[from[0]][from[1]]?.getColor();
  }

  validateMove(from: number[], to: number[]): boolean {
    const piece = this.board[from[0]][from[1]];
    if (!piece) {
      return false;
    }
    return piece.getValidMoves().some((movement) => {
      movement.validateMove(from, to);
    });
  }

  toBinary(): Uint8Array {
    const board = new Uint8Array(32);

    const colorPiecePositionMap = this.getColorPiecePositionMap();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        if (piece) {
          colorPiecePositionMap
            .get(piece.getColor())
            ?.get(piece.getType())
            ?.push(i * 8 + j);
        }
      }
    }

    this.createBinary(board, ChessPieceColor.White, colorPiecePositionMap);
    this.createBinary(board, ChessPieceColor.Black, colorPiecePositionMap);

    return board;
  }

  private createBinary(
    board: Uint8Array<ArrayBuffer>,
    color: ChessPieceColor,
    colorPiecePositionMap: Map<ChessPieceColor, Map<ChessPieceType, number[]>>,
  ) {
    const prefix = color === ChessPieceColor.White ? 0 : 16;

    for (let i = 0; i < 8; i++) {
      board[prefix + i] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Pawn)?.[i] ?? 0;
    }

    for (let i = 0; i < 2; i++) {
      board[prefix + i + 8] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Rook)?.[i] ?? 0;
    }

    for (let i = 0; i < 2; i++) {
      board[prefix + i + 8 + 2] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Knight)?.[i] ?? 0;
    }

    for (let i = 0; i < 2; i++) {
      board[prefix + i + 8 + 2 + 2] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Bishop)?.[i] ?? 0;
    }

    board[prefix + 0 + 8 + 2 + 2 + 1] =
      colorPiecePositionMap.get(color)?.get(ChessPieceType.King)?.[0] ?? 0;

    board[prefix + 0 + 8 + 2 + 2 + 1 + 1] =
      colorPiecePositionMap.get(color)?.get(ChessPieceType.Queen)?.[0] ?? 0;
  }

  getColorPiecePositionMap(): Map<
    ChessPieceColor,
    Map<ChessPieceType, Array<number>>
  > {
    const colorPiecePositionMap = new Map<
      ChessPieceColor,
      Map<ChessPieceType, Array<number>>
    >();

    colorPiecePositionMap.set(
      ChessPieceColor.White,
      this.getPiecePositionMap(),
    );

    colorPiecePositionMap.set(
      ChessPieceColor.Black,
      this.getPiecePositionMap(),
    );

    return colorPiecePositionMap;
  }

  getPiecePositionMap(): Map<ChessPieceType, Array<number>> {
    const piecePositionMap = new Map<ChessPieceType, Array<number>>();
    piecePositionMap.set(ChessPieceType.Pawn, Array(8).fill(null));
    piecePositionMap.set(ChessPieceType.Rook, Array(2).fill(null));
    piecePositionMap.set(ChessPieceType.Knight, Array(2).fill(null));
    piecePositionMap.set(ChessPieceType.Bishop, Array(2).fill(null));
    piecePositionMap.set(ChessPieceType.King, Array(1).fill(null));
    piecePositionMap.set(ChessPieceType.Queen, Array(1).fill(null));
    return piecePositionMap;
  }
}
