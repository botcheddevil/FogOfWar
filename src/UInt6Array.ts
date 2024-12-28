export class UInt6Array {
  private buffer: Array<string>;
  private length: number; // Number of 6-bit values

  constructor(length: number) {
    // Calculate bytes needed: (length * 6 + 7) / 8 rounded up
    // const byteLength = Math.ceil((length * 6) / 8);
    this.buffer = Array(length).fill('');
    this.length = length;
  }

  set(values: Array<number>): void {
    if (values.length > this.length) {
      throw new Error('Index out of bounds');
    }
    if (values.some((value) => value < 0 || value > 63)) {
      throw new Error('Value must be between 0 and 63');
    }
    this.buffer = values.map((value) => this.binary6Bit(value));
  }

  binary6Bit(num: number): string {
    return (num >>> 0).toString(2).padStart(6, '0');
  }

  getBuffer(): Uint8Array {
    const bitString = this.buffer.join('').concat('00000000');
    const chunks = bitString.match(/.{1,8}/g) || [];
    chunks.pop();
    return Uint8Array.from(chunks.map((chunk) => parseInt(chunk, 2)));
  }
}
