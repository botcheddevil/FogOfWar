import { ChessPieceMovementForwardDouble } from '../ChessPieceMovementForwardDouble';
describe('ChessPieceMovementForwardDouble', () => {
  let movement: ChessPieceMovementForwardDouble;
  beforeAll(() => {
    movement = new ChessPieceMovementForwardDouble();
  });
  it('should pass for white piece', () => {
    expect(movement.validateMove([1, 1], [3, 1], 1)).toBeTruthy();

    expect(movement.validateMove([1, 3], [3, 3], 1)).toBeTruthy();
  });

  it('should fail for black piece', () => {
    expect(movement.validateMove([1, 1], [2, 1], -1)).toBeFalsy();

    expect(movement.validateMove([1, 3], [2, 3], -1)).toBeFalsy();
  });

  it('should pass for black piece', () => {
    expect(movement.validateMove([6, 1], [4, 1], -1)).toBeTruthy();

    expect(movement.validateMove([6, 3], [4, 3], -1)).toBeTruthy();
  });

  it('should fail for white piece', () => {
    expect(movement.validateMove([6, 1], [5, 1], 1)).toBeFalsy();
    expect(movement.validateMove([6, 3], [5, 3], 1)).toBeFalsy();
    expect(movement.validateMove([7, 3], [5, 3], 1)).toBeFalsy();
    expect(movement.validateMove([6, 3], [7, 3], 1)).toBeFalsy();
    expect(movement.validateMove([6, 3], [5, 4], 1)).toBeFalsy();
    expect(movement.validateMove([6, 3], [5, 2], 1)).toBeFalsy();
  });
});
