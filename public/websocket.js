import { pieceSequence } from './constants.js';

let socket;

function packetToBytes(gameId, sessionId) {
  // Total size is 32 bytes (16 bytes for each UUID)
  const buffer = new Uint8Array(32);

  // Convert and store gameId
  const gameIdBytes = uuidToBytes(gameId);
  buffer.set(gameIdBytes, 0);

  // Convert and store sessionId
  const sessionIdBytes = uuidToBytes(sessionId);
  buffer.set(sessionIdBytes, 16);

  return buffer;
}

function uuidToBytes(uuid) {
  // Remove dashes and convert to array of bytes
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, (i + 1) * 2), 16);
  }

  return bytes;
}

function extractPositionsFromUint8Array(buffer) {
  let positions = [];
  let types = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
  let colors = ['white', 'black'];
  let zeroIndex = -1;

  const { zeroPieceColor, zeroPieceType, turnOfPlayer, gameStatus } =
    decodeLastByte(buffer[24]);
  zeroIndex = pieceSequence.findIndex(
    (piece) =>
      piece.color === colors[zeroPieceColor] &&
      piece.type === types[zeroPieceType],
  );
  console.log('Zero Piece Color:', colors[zeroPieceColor]);
  console.log('Zero Piece Type:', types[zeroPieceType]);
  console.log('Zero Index:', zeroIndex);

  positions = unpackPositions(buffer, zeroIndex);
  return { positions, turnOfPlayer, gameStatus };
}

function unpackPositions(buffer, zeroIndex) {
  const positions = [];
  let currentByteIndex = 0;
  let bitPosition = 0;

  // We expect 32 positions (chess board positions)
  for (let i = 0; i < 32; i++) {
    let value = 0;

    // Read 6 bits for each position
    // First, get the current byte
    let currentByte = buffer[currentByteIndex];

    // If we need bits from the next byte
    if (bitPosition + 6 > 8) {
      // Get remaining bits from current byte
      const bitsFromCurrent = 8 - bitPosition;
      const currentByteMask = (1 << bitsFromCurrent) - 1;
      value = (currentByte >> bitPosition) & currentByteMask;

      // Get required bits from next byte
      const bitsNeeded = 6 - bitsFromCurrent;
      const nextByte = buffer[currentByteIndex + 1];
      const nextByteMask = (1 << bitsNeeded) - 1;
      value |= (nextByte & nextByteMask) << bitsFromCurrent;

      // Update positions for next iteration
      bitPosition = bitsNeeded;
      currentByteIndex++;
    } else {
      // All bits come from current byte
      value = (currentByte >> bitPosition) & 0x3f;
      bitPosition += 6;

      // Move to next byte if we've used all bits
      if (bitPosition === 8) {
        bitPosition = 0;
        currentByteIndex++;
      }
    }

    // Handle zero position
    if (i !== zeroIndex && value === 0) {
      positions.push(null);
    } else {
      positions.push(value);
    }
  }

  return positions;
}

function decodeLastByte(encoded) {
  console.log('Received Last Byte:', encoded.toString(2).padStart(8, '0'));

  // Extract each component according to the bit structure:
  // Bit 0: Zero Piece Color
  // Bits 1-3: Zero Piece Type
  // Bit 4: Turn of Player
  // Bits 5-7: Game Status

  return {
    // Extract bit 0
    zeroPieceColor: encoded & 0b1,

    // Extract bits 1-3 (Zero Piece Type)
    zeroPieceType: (encoded >> 1) & 0b111,

    // Extract bit 4 (Turn of Player)
    turnOfPlayer: ((encoded >> 4) & 0b1) === 1,

    // Extract bits 5-7 (Game Status)
    gameStatus: (encoded >> 5) & 0b111,
  };
}

export function liveConnect(cbDrawBoard) {
  liveDisconnect();
  socket = new WebSocket('ws://localhost:3000');

  socket.onopen = function () {
    const sessionId = localStorage.getItem('sessionId');
    const gameId = localStorage.getItem('gameId');
    socket.send(packetToBytes(gameId, sessionId));
    console.log('WebSocket connection established');
  };

  socket.onmessage = async function (event) {
    if (event.data instanceof Blob) {
      const buffer = await event.data.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      switch (bytes.length) {
        case 25:
          const { positions, turnOfPlayer, gameStatus } =
            extractPositionsFromUint8Array(bytes);
          localStorage.setItem('turnOfPlayer', turnOfPlayer);
          localStorage.setItem('gameStatus', gameStatus);
          console.log('Received positions:', positions);
          cbDrawBoard(positions);
          break;
        default:
          const message = new TextDecoder().decode(bytes);
          handleMessage(message);
      }
    } else {
      console.log('WebSocket binary message not received:', event.data);
    }
    console.log('WebSocket message received:', event.data);
  };

  socket.onclose = function () {
    console.log('WebSocket connection closed');
  };

  socket.onerror = function (error) {
    console.error('WebSocket error:', error);
  };
}

function handleMessage(message) {
  console.log('Handling message', message);
  // Get first letter of message
  const messageCode = message[0];
  switch (messageCode) {
    case 'c':
      console.log('Game connected.');
      break;
    case 'o':
      // Remove first letter and parse the rest of the message
      const opponent = message.slice(1);
      console.log('Got Opponent', opponent);
      localStorage.setItem('playerOpponent', opponent);
    case 'i':
      console.log('Invalid Move.');
      break;
    case 'w':
      console.log('White player!');
      localStorage.setItem('playerColor', message);
      break;
    case 'b':
      console.log('Black player!');
      localStorage.setItem('playerColor', message);
      break;
  }
}

export function liveSendMove(move) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(move);
  }
}

export function liveDisconnect() {
  if (socket) {
    socket.close();
  }
}
