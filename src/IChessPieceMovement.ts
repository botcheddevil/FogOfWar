export interface IChessPieceMovement {
  validateMove(
    from: number[],
    to: number[],
    direction?: number,
    toCaptureable?: boolean,
  ): boolean;
}
