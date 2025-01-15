export class BitPacker {
  static packUInt6Array(array: Array<number | null>): Buffer {
    const length = array.length;
    const buffer = Buffer.alloc(Math.ceil((length * 6) / 8)); // Changed buffer size calculation
    let bufferIndex = 0;
    let bitIndex = 0;

    for (let i = 0; i < length; i++) {
      const value = array[i] === null ? 0 : (array[i] as number);
      buffer[bufferIndex] |= value << bitIndex;
      bitIndex += 6;
      if (bitIndex >= 8) {
        bufferIndex++;
        bitIndex -= 8;
        if (bufferIndex < buffer.length) {
          // Add boundary check
          buffer[bufferIndex] = value >> (6 - bitIndex);
        }
      }
    }
    return buffer;
  }

  static unpackUInt6Array(buffer: Buffer): number[] {
    const length = Math.floor((buffer.length * 8) / 6); // Calculate correct number of 6-bit integers
    const array = new Array(length);
    let bufferIndex = 0;
    let bitIndex = 0;

    for (let i = 0; i < length; i++) {
      array[i] = (buffer[bufferIndex] >> bitIndex) & 0x3f;
      bitIndex += 6;
      if (bitIndex >= 8) {
        bufferIndex++;
        bitIndex -= 8;
        if (bufferIndex < buffer.length) {
          // Add boundary check
          array[i] |= (buffer[bufferIndex] << (6 - bitIndex)) & 0x3f;
        }
      }
    }
    return array;
  }

  static packUInt6ArrayS(array: Array<number | null>): Uint8Array {
    const binaryStringArray = array.map((value) => {
      if (value === null) {
        return '000000';
      }
      return value.toString(2).padStart(6, '0');
    });

    const bitString = binaryStringArray.join('').concat('00000000');
    const chunks = bitString.match(/.{1,8}/g) || [];
    chunks.pop();
    return Uint8Array.from(chunks.map((chunk) => parseInt(chunk, 2)));
  }

  static unpackUInt6ArrayS(buffer: Uint8Array): number[] {
    const bitString = Array.from(buffer)
      .map((value) => value.toString(2).padStart(8, '0'))
      .join('');
    const chunks = bitString.match(/.{1,6}/g) || [];
    return chunks.map((chunk) => parseInt(chunk, 2));
  }
}
