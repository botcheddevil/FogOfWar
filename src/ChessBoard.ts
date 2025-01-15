import { BitPacker } from './BitPacker';
import { ChessPiece } from './ChessPiece';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceFactory } from './ChessPieceFactory';
import { ChessPieceType } from './ChessPieceType';
import { GameStateEncoder } from './GameStateEncoder';
import { ILogger } from './ILogger';
import { GameResult, Move } from './types';

export class ChessBoard {
  static positionSequence: Array<ChessPieceType> = [
    ChessPieceType.Pawn,
    ChessPieceType.Pawn,
    ChessPieceType.Pawn,
    ChessPieceType.Pawn,
    ChessPieceType.Pawn,
    ChessPieceType.Pawn,
    ChessPieceType.Pawn,
    ChessPieceType.Pawn,
    ChessPieceType.Rook,
    ChessPieceType.Rook,
    ChessPieceType.Knight,
    ChessPieceType.Knight,
    ChessPieceType.Bishop,
    ChessPieceType.Bishop,
    ChessPieceType.King,
    ChessPieceType.Queen,
  ];

  constructor(
    private moves: Move[],
    private positions: Array<number | null>,
    private result: GameResult,
    private logger: ILogger,
  ) {}

  getPositions(): Array<number | null> {
    return this.positions;
  }

  getResult(): GameResult {
    return this.result;
  }

  getPiece(position: number): ChessPiece | null {
    const pieceIndex = this.positions.indexOf(position);
    if (pieceIndex === -1) {
      return null;
    }
    const color = Math.floor(pieceIndex / 16) as ChessPieceColor;
    const type = ChessBoard.positionSequence[pieceIndex % 16];
    return ChessPieceFactory.createPiece(type, color);
  }

  getPieceAtRowCol(row: number, col: number): ChessPiece | null {
    return this.getPiece(row * 8 + col);
  }

  setPiece(fromPosition: number, toPosition: number): void {
    const fromPieceIndex = this.positions.indexOf(fromPosition);
    const toPieceIndex = this.positions.indexOf(toPosition);
    this.positions[fromPieceIndex] = toPosition;
    this.positions[toPieceIndex] = null;
  }

  movePiece(
    playerColor: ChessPieceColor,
    start: number,
    end: number,
  ): Move | null {
    const from = [Math.floor(start / 8), start % 8];
    const to = [Math.floor(end / 8), end % 8];
    this.logger.info(`From: ${from} To: ${to}`);

    const piece = this.getPiece(start);
    if (!piece) {
      this.logger.error('No piece found at position', { from });
      return null;
    }

    if (piece.getColor() !== playerColor) {
      this.logger.error('Not allowed to move piece');
      return null;
    }

    if (!this.isValidTurn(piece.getColor())) {
      this.logger.error('Invalid turn');
      return null;
    }

    if (!this.validateMove(from, to)) {
      this.logger.error('Invalid move');
      return null;
    }

    if (this.hasObstruction(from, to)) {
      this.logger.error('Obstruction found');
      return null;
    }

    if (!this.isPieceCapturable(from, to)) {
      this.logger.error('Piece not capturable');
      return null;
    }

    this.setPiece(start, end);

    this.result = this.calculateResult();

    return {
      start,
      end,
      pieceColor: piece.getColor(),
      pieceType: piece.getType(),
      timestamp: new Date(),
    } as Move;
  }

  private calculateResult(): GameResult {
    const kingSeqIndex = ChessBoard.positionSequence.indexOf(
      ChessPieceType.King,
    );

    if (this.positions[kingSeqIndex] === null) {
      return GameResult.BLACK_WINS;
    }

    if (this.positions[kingSeqIndex + 16] === null) {
      return GameResult.WHITE_WINS;
    }
    return GameResult.ONGOING;
  }

  hasObstruction(from: number[], to: number[]): boolean {
    // Get all the squares between from and to
    let row = from[0];
    let col = from[1];
    while (row !== to[0] && col !== to[1]) {
      row += row < to[0] ? 1 : -1;
      col += col < to[1] ? 1 : -1;
      if (
        this.getPieceAtRowCol(row, col) !== null &&
        row !== to[0] &&
        col !== to[1]
      ) {
        return true;
      }
    }

    while (row !== to[0]) {
      row += row < to[0] ? 1 : -1;
      if (this.getPieceAtRowCol(row, col) !== null && row !== to[0]) {
        return true;
      }
    }

    while (col !== to[1]) {
      col += col < to[1] ? 1 : -1;
      if (this.getPieceAtRowCol(row, col) !== null && col !== to[1]) {
        return true;
      }
    }

    return false;
  }

  isValidTurn(color: ChessPieceColor): boolean {
    const lastMove = this.moves[this.moves.length - 1];
    if (!lastMove) {
      return color === ChessPieceColor.White;
    }
    return lastMove.pieceColor !== color;
  }

  isPieceCapturable(from: number[], to: number[]): boolean {
    const piece = this.getPieceAtRowCol(to[0], to[1]);
    if (!piece) {
      return true;
    }
    return (
      piece.getColor() !== this.getPieceAtRowCol(from[0], from[1])?.getColor()
    );
  }

  validateMove(from: number[], to: number[]): boolean {
    const piece = this.getPieceAtRowCol(from[0], from[1]);
    if (!piece) {
      this.logger.error('No piece found at position', { from });
      return false;
    }
    return piece.getValidMoves().some((movement) => {
      const direction = piece.getColor() === ChessPieceColor.White ? 1 : -1;
      const toPiece = this.getPieceAtRowCol(to[0], to[1]);
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

  getZeroPiece(): ChessPiece {
    const position = this.positions.findIndex((position) => position === 0);
    if (position === -1) {
      return new ChessPiece(ChessPieceType.None, ChessPieceColor.White, []);
    }
    const color = Math.floor(position / 16) as ChessPieceColor;
    const type = ChessBoard.positionSequence[position % 16];
    return ChessPieceFactory.createPiece(type, color);
  }

  toBinary(turnOfPlayer: boolean = true): Uint8Array {
    // - Generate the binary representation of the game state
    const first24Bytes = BitPacker.packUInt6Array(this.getPositions());
    const zeroPiece = this.getZeroPiece();
    const encoded25thByte = GameStateEncoder.encode(
      zeroPiece.getColor(),
      zeroPiece.getType(),
      turnOfPlayer,
      this.getResult(),
    );
    // - Merge the 24 bytes and the 25th byte
    return Buffer.concat([first24Bytes, Buffer.from(encoded25thByte)]);
  }
}
