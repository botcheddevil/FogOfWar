import { Server } from 'http';
import WebSocket from 'ws';
import { WebSocketHandler } from '../WebSocketHandler';
import { ILogger } from '../ILogger';

describe('WebSocketHandler', () => {
  let mockServer: Server;
  let mockLogger: ILogger;
  let wsClient: WebSocket;

  beforeAll(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    mockServer = new Server();
    new WebSocketHandler(mockServer, mockLogger);
    await mockServer.listen(8080);
  });

  afterAll(async () => {
    await mockServer.close();
  });

  beforeEach(() => {
    wsClient = new WebSocket('ws://localhost:8080');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  //Auth - username and password
  //Move - p1 to p2
  //State - (16 + 16) = 32 peices
  // 64 Positions which can be represented by 6 bits
  // 6 * 32 = 192 bits = 24 bytes
  // 24 bytes * 50 moves = 1200 bytes = 1.2 KB * 1000 = 1.2 MB
  // 32 bytes * 50 moves = 1600 bytes = 1.6 KB * 1000 = 1.6 MB

  it('should initialize WebSocket server and log constructor message', (done) => {
    wsClient.on('open', () => {
      const binaryData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      wsClient.send(binaryData);
    });

    wsClient.onmessage = (event) => {
      const encoder = new TextEncoder();
      const data = new Uint8Array(encoder.encode(event.data.toString()));
      console.log(`Received binary data: ${data}`);
      done();
    };
  });
});
