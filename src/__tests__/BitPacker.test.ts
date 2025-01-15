import { BitPacker } from '../BitPacker';

describe('BitPacker', () => {
  const LENGTH = 1000;
  const data = Array(32 * LENGTH)
    .fill(0)
    .map((_, _i) => Math.floor(Math.random() * 64));

  it('should pass', () => {
    // console.time('packUInt6Array');
    const packed = BitPacker.packUInt6Array(data);
    const unpacked = BitPacker.unpackUInt6Array(packed);
    // console.timeEnd('packUInt6Array');
    expect(packed.length).toBe(24 * LENGTH);
    expect(unpacked).toEqual(data);
  });

  it('should pass by string', () => {
    // console.time('packUInt6ArrayS');
    const packed = BitPacker.packUInt6ArrayS(data);
    const unpacked = BitPacker.unpackUInt6ArrayS(packed);
    // console.timeEnd('packUInt6ArrayS');
    expect(packed.length).toBe(24 * LENGTH);
    expect(unpacked).toEqual(data);
  });

  it('should pass with string', () => {
    const packed = BitPacker.packUInt6Array(data);
    const packedByS = BitPacker.packUInt6ArrayS(data);

    const unpacked = BitPacker.unpackUInt6Array(packed);
    const unpackedByS = BitPacker.unpackUInt6ArrayS(packedByS);

    expect(data.length).toBe(32 * LENGTH);
    expect(packed.length).toBe(24 * LENGTH);
    expect(packedByS.length).toBe(24 * LENGTH);
    expect(unpacked).toStrictEqual(unpackedByS);
  });
});
