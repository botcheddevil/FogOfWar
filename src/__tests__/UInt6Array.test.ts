import { UInt6Array } from '../UInt6Array';

describe('Example Test Suite', () => {
  it('should pass', () => {
    const arr = new UInt6Array(3);
    let numbersToPackBitString = '';
    const numbersToPack = [1, 2, 3];

    arr.set(numbersToPack);

    numbersToPack.forEach((num, _index) => {
      numbersToPackBitString += printBinary6Bit(num);
    });

    numbersToPackBitString += '00000000';
    const bit8Arr = getChunks(numbersToPackBitString).map((chunk) =>
      parseInt(chunk, 2),
    );
    bit8Arr.pop();
    expect(arr.getBuffer()).toEqual(new Uint8Array(bit8Arr));
    expect(true).toBe(true);
  });
});

function printBinary6Bit(num: number): string {
  return (num >>> 0).toString(2).padStart(6, '0');
}

function getChunks(str: string) {
  return str.match(/.{1,8}/g) || [];
}
