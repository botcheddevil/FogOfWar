import { ChessBoard } from './ChessBoard';
import { ChessPieceColor } from './ChessPieceColor';
import { ChessPieceFactory } from './ChessPieceFactory';
import { ChessPieceListFactory } from './ChessPieceListFactory';
import { ChessPieceType } from './ChessPieceType';
import { ILogger } from './ILogger';

export class ChessBoardFactory {
  static sequence: Array<ChessPieceType> = [
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

  static createBoardFromUInt6Array(
    uInt6ArrayPacked: Uint8Array,
    logger: ILogger,
  ): ChessBoard {
    const positions = [];
    let currentByte = 0;
    let bitsAvailable = 0;
    let position = 0;
    let zeroPiece = null;

    if (uInt6ArrayPacked[24] !== undefined) {
      zeroPiece = ChessPieceFactory.decodePiece(uInt6ArrayPacked[24]);
    }

    for (let i = 0; i < 24; i++) {
      currentByte = (currentByte << 8) | uInt6ArrayPacked[i];
      bitsAvailable += 8;

      while (bitsAvailable >= 6 && positions.length < 32) {
        position = (currentByte >> (bitsAvailable - 6)) & 0x3f;
        // First, let's handle the base case of position pushing
        // If the position is 0, that means its removed from the board
        const basePosition = position === 0 ? -1 : position;

        // For the zero piece, we need to set position to 0
        if (
          zeroPiece !== null &&
          zeroPiece.getColor() === Math.floor(positions.length / 16) &&
          zeroPiece.getType() ===
            ChessBoardFactory.sequence[positions.length % 16] &&
          position === 0
        ) {
          positions.push(0);
        } else {
          positions.push(basePosition);
        }

        bitsAvailable -= 6;
      }
    }

    // Negative one means the piece is removed from the board
    // It translates to 255 in the Uint8Array
    return ChessBoardFactory.createBoardFromUInt8Array(
      Uint8Array.from(positions),
      logger,
    );
  }

  static createBoardFromUInt8Array(
    board: Uint8Array,
    logger: ILogger,
  ): ChessBoard {
    const fullBoard = new Array(8).fill(null).map(() => Array(8).fill(null));
    for (let i = 0; i < 32; i++) {
      // Check if the piece is removed from the board
      if (board[i] === 255) {
        continue;
      }
      const row = Math.floor(board[i] / 8);
      const col = board[i] % 8;
      const pieceType: ChessPieceType = ChessBoardFactory.sequence[i % 16];
      const color = i < 16 ? ChessPieceColor.White : ChessPieceColor.Black;

      fullBoard[row][col] = ChessPieceFactory.createPiece(pieceType, color);
    }

    return new ChessBoard(fullBoard, logger);
  }

  static createBoard(logger: ILogger): ChessBoard {
    const board = [
      ChessPieceListFactory.createPieceListNobelity(ChessPieceColor.White),
      ChessPieceListFactory.createPieceListPeasantry(ChessPieceColor.White),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      ChessPieceListFactory.createPieceListPeasantry(ChessPieceColor.Black),
      ChessPieceListFactory.createPieceListNobelity(ChessPieceColor.Black),
    ];
    return new ChessBoard(board, logger);
  }
}
