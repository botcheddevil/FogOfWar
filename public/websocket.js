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
  const positions = [];
  let currentByte = 0;
  let bitsAvailable = 0;
  let position = 0;
  let types = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
  let colors = ['white', 'black'];
  let zeroIndex = -1;

  if (buffer.length === 25) {
    const { color, type } = decodePiece(buffer[24]);
    zeroIndex = pieceSequence.findIndex(
      (piece) => piece.color === colors[color] && piece.type === types[type],
    );
  }

  for (let i = 0; i < 24; i++) {
    currentByte = (currentByte << 8) | buffer[i];
    bitsAvailable += 8;

    while (bitsAvailable >= 6 && positions.length < 32) {
      position = (currentByte >> (bitsAvailable - 6)) & 0x3f;
      if (positions.length !== zeroIndex && position === 0) {
        positions.push(null);
      } else {
        positions.push(position);
      }
      bitsAvailable -= 6;
    }
  }

  return positions;
}

function decodePiece(byte) {
  const color = (byte >> 3) & 1; // Shift right 3 and mask with 1 to get color
  const type = byte & 0b111; // Mask with 111 to get type (3 bits)
  return { color, type };
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
        case 1:
          const message = new TextDecoder().decode(bytes);
          handleMessage(message);
        case 25:
        case 24:
          const positions = extractPositionsFromUint8Array(bytes);
          console.log('Received positions:', positions);
          cbDrawBoard(positions);
          break;
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
  console.log(message);
  switch (message) {
    case 'c':
      console.log('Game connected.');
      break;
    case 'i':
      console.log('Invalid Move.');
      break;
    case 'w':
      console.log('White win!');
      break;
    case 'b':
      console.log('Black win!');
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
