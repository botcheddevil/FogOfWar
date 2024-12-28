import { ChessPieceColor } from '../ChessPieceColor';
import { ChessPieceMovementForwardDouble } from '../ChessPieceMovementForwardDouble';
describe('ChessPieceMovementForwardDouble', () => {
  let movement: ChessPieceMovementForwardDouble;
  beforeAll(() => {
    movement = new ChessPieceMovementForwardDouble();
  });
  it('should pass for white piece', () => {
    expect(
      movement.validateMove([1, 1], [3, 1], ChessPieceColor.White),
    ).toBeTruthy();

    expect(
      movement.validateMove([1, 3], [3, 3], ChessPieceColor.White),
    ).toBeTruthy();
  });

  it('should fail for black piece', () => {
    expect(
      movement.validateMove([1, 1], [2, 1], ChessPieceColor.Black),
    ).toBeFalsy();

    expect(
      movement.validateMove([1, 3], [2, 3], ChessPieceColor.Black),
    ).toBeFalsy();
  });

  it('should pass for black piece', () => {
    expect(
      movement.validateMove([6, 1], [4, 1], ChessPieceColor.Black),
    ).toBeTruthy();

    expect(
      movement.validateMove([6, 3], [4, 3], ChessPieceColor.Black),
    ).toBeTruthy();
  });

  it('should fail for white piece', () => {
    expect(
      movement.validateMove([6, 1], [5, 1], ChessPieceColor.White),
    ).toBeFalsy();
    expect(
      movement.validateMove([6, 3], [5, 3], ChessPieceColor.White),
    ).toBeFalsy();
    expect(
      movement.validateMove([7, 3], [5, 3], ChessPieceColor.White),
    ).toBeFalsy();
    expect(
      movement.validateMove([6, 3], [7, 3], ChessPieceColor.White),
    ).toBeFalsy();
    expect(
      movement.validateMove([6, 3], [5, 4], ChessPieceColor.White),
    ).toBeFalsy();
    expect(
      movement.validateMove([6, 3], [5, 2], ChessPieceColor.White),
    ).toBeFalsy();
  });
});
