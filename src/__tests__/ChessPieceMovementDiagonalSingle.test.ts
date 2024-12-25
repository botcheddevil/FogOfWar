import { ChessPieceMovementDiagonalSingle } from '../ChessPieceMovementDiagonalSingle';
describe('ChessPieceMovementDiagonalSingle', () => {
  let movement: ChessPieceMovementDiagonalSingle;
  beforeAll(() => {
    movement = new ChessPieceMovementDiagonalSingle();
  });
  it('should pass', () => {
    expect(movement.validateMove([0, 0], [1, 1])).toBe(true);
    expect(movement.validateMove([2, 2], [1, 1])).toBe(true);
    expect(movement.validateMove([2, 3], [3, 4])).toBe(true);
    expect(movement.validateMove([5, 4], [4, 3])).toBe(true);
    expect(movement.validateMove([2, 2], [1, 1])).toBe(true);
    expect(movement.validateMove([0, 2], [1, 1])).toBe(true);
  });

  it('should fail', () => {
    expect(movement.validateMove([0, 0], [2, 2])).toBe(false);
    expect(movement.validateMove([0, 0], [1, 0])).toBe(false);
    expect(movement.validateMove([3, 3], [5, 2])).toBe(false);
    expect(movement.validateMove([2, 3], [3, 5])).toBe(false);
    expect(movement.validateMove([3, 4], [4, 4])).toBe(false);
    expect(movement.validateMove([5, 4], [4, 4])).toBe(false);
  });
});
