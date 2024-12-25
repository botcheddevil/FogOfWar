import { ChessPieceMovementDiagonal } from '../ChessPieceMovementDiagonal';
describe('ChessPieceMovementDiagonal', () => {
  let chessPieceMovementDiagonal: ChessPieceMovementDiagonal;
  beforeAll(() => {
    chessPieceMovementDiagonal = new ChessPieceMovementDiagonal();
  });
  it('should pass', () => {
    expect(chessPieceMovementDiagonal.validateMove([0, 0], [1, 1])).toBe(true);
    expect(chessPieceMovementDiagonal.validateMove([3, 3], [1, 1])).toBe(true);
    expect(chessPieceMovementDiagonal.validateMove([2, 3], [3, 4])).toBe(true);
    expect(chessPieceMovementDiagonal.validateMove([5, 4], [4, 3])).toBe(true);
    expect(chessPieceMovementDiagonal.validateMove([2, 2], [1, 1])).toBe(true);
    expect(chessPieceMovementDiagonal.validateMove([0, 2], [1, 1])).toBe(true);
  });

  it('should fail', () => {
    expect(chessPieceMovementDiagonal.validateMove([0, 0], [1, 0])).toBe(false);
    expect(chessPieceMovementDiagonal.validateMove([3, 3], [5, 2])).toBe(false);
    expect(chessPieceMovementDiagonal.validateMove([2, 3], [3, 5])).toBe(false);
    expect(chessPieceMovementDiagonal.validateMove([3, 4], [4, 4])).toBe(false);
    expect(chessPieceMovementDiagonal.validateMove([5, 4], [4, 4])).toBe(false);
  });
});
