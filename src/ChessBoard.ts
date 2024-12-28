import { ChessBoardFactory } from './ChessBoardFactory';
import { ChessPiece } from './ChessPiece';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceFactory } from './ChessPieceFactory';
import { ChessPieceType } from './ChessPieceType';
import { ILogger } from './ILogger';
import { UInt6Array } from './UInt6Array';

export class ChessBoard {
  private fullBoard: (ChessPiece | null)[][];
  private logger: ILogger;

  constructor(board: ChessPiece[][], logger: ILogger) {
    this.fullBoard = board;
    this.logger = logger;
  }

  movePiece(from: number[], to: number[]): boolean {
    if (!this.validateMove(from, to)) {
      this.logger.error('Invalid move');
      return false;
    }

    if (this.hasObstruction(from, to)) {
      this.logger.error('Obstruction found');
      return false;
    }

    if (!this.isPieceCapturable(from, to)) {
      this.logger.error('Piece not capturable');
      return false;
    }

    this.fullBoard[to[0]][to[1]] = this.fullBoard[from[0]][from[1]];
    this.fullBoard[from[0]][from[1]] = null;
    return true;
  }

  hasObstruction(from: number[], to: number[]): boolean {
    // Get all the squares between from and to
    let row = from[0];
    let col = from[1];
    while (row !== to[0] && col !== to[1]) {
      row += row < to[0] ? 1 : -1;
      col += col < to[1] ? 1 : -1;
      if (this.fullBoard[row][col] !== null && row !== to[0] && col !== to[1]) {
        return true;
      }
    }

    while (row !== to[0]) {
      row += row < to[0] ? 1 : -1;
      if (this.fullBoard[row][col] !== null && row !== to[0]) {
        return true;
      }
    }

    while (col !== to[1]) {
      col += col < to[1] ? 1 : -1;
      if (this.fullBoard[row][col] !== null && col !== to[1]) {
        return true;
      }
    }

    return false;
  }

  isPieceCapturable(from: number[], to: number[]): boolean {
    const piece = this.fullBoard[to[0]][to[1]];
    if (!piece) {
      return true;
    }
    return piece.getColor() !== this.fullBoard[from[0]][from[1]]?.getColor();
  }

  validateMove(from: number[], to: number[]): boolean {
    const piece = this.fullBoard[from[0]][from[1]];
    if (!piece) {
      this.logger.error('No piece found at position', { from });
      return false;
    }
    return piece.getValidMoves().some((movement) => {
      const direction = piece.getColor() === ChessPieceColor.White ? 1 : -1;
      const toPiece = this.fullBoard[to[0]][to[1]];
      const toCaptureable =
        toPiece !== null && toPiece.getColor() !== piece.getColor();
      const result = movement.validateMove(from, to, direction, toCaptureable);
      this.logger.debug('Validating movement', {
        movement: movement.constructor.name,
        result,
        piece: piece.getType(),
        direction,
        toCaptureable,
      });
      return result;
    });
  }

  toBinary(): Uint8Array {
    const shortBoard = new Array(32).fill(null);

    const colorPiecePositionMap = this.getColorPiecePositionMap();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.fullBoard[i][j];
        if (piece) {
          const positions = colorPiecePositionMap
            .get(piece.getColor())
            ?.get(piece.getType());

          if (positions) {
            const index = positions.indexOf(null as unknown as number);
            if (index !== -1) {
              positions[index] = i * 8 + j;
            }
          }
        }
      }
    }

    this.createBinary(shortBoard, ChessPieceColor.White, colorPiecePositionMap);
    this.createBinary(shortBoard, ChessPieceColor.Black, colorPiecePositionMap);

    this.logger.debug('Board positions:', { board: shortBoard });

    const zeroIndex = shortBoard.indexOf(0);

    if (zeroIndex !== -1) {
      const mergedArray = new Uint8Array(25);
      const zeroType = ChessBoardFactory.sequence[zeroIndex % 16];
      const zeroColor =
        zeroIndex < 16 ? ChessPieceColor.White : ChessPieceColor.Black;
      const encodedPiece = ChessPieceFactory.createPiece(
        zeroType,
        zeroColor,
      ).encodePiece();
      mergedArray.set(this.encodeChessPosition(shortBoard));
      mergedArray.set([encodedPiece], 24);

      return mergedArray;
    }

    return this.encodeChessPosition(shortBoard);
  }

  private encodeChessPosition(positions: number[]): Uint8Array {
    const uint6arr = new UInt6Array(32); // 32 pieces
    uint6arr.set(positions);
    return uint6arr.getBuffer(); // Returns 24-byte Uint8Array
  }

  private createBinary(
    board: Array<number | null>,
    color: ChessPieceColor,
    colorPiecePositionMap: Map<ChessPieceColor, Map<ChessPieceType, number[]>>,
  ) {
    const prefix = color === ChessPieceColor.White ? 0 : 16;

    for (let i = 0; i < 8; i++) {
      board[prefix + i] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Pawn)?.[i] ?? null;
    }

    for (let i = 0; i < 2; i++) {
      board[prefix + i + 8] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Rook)?.[i] ?? null;
    }

    for (let i = 0; i < 2; i++) {
      board[prefix + i + 8 + 2] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Knight)?.[i] ??
        null;
    }

    for (let i = 0; i < 2; i++) {
      board[prefix + i + 8 + 2 + 2] =
        colorPiecePositionMap.get(color)?.get(ChessPieceType.Bishop)?.[i] ??
        null;
    }

    board[prefix + 0 + 8 + 2 + 2 + 1 + 1] =
      colorPiecePositionMap.get(color)?.get(ChessPieceType.King)?.[0] ?? null;

    board[prefix + 0 + 8 + 2 + 2 + 1 + 1 + 1] =
      colorPiecePositionMap.get(color)?.get(ChessPieceType.Queen)?.[0] ?? null;
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
