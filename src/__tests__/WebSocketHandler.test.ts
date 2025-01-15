import { Server } from 'http';
import WebSocket from 'ws';
import { WebSocketHandler } from '../WebSocketHandler';
import { ILogger } from '../ILogger';
import { IDb } from '../IDb';

describe('WebSocketHandler', () => {
  let mockServer: Server;
  let mockLogger: ILogger;
  let wsClient: WebSocket;

  beforeAll(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      silly: jest.fn(),
      debug: jest.fn(),
    };

    const mockDb: jest.Mocked<IDb> = {
      connect: jest.fn(),
      close: jest.fn(),
      createUser: jest.fn(),
      validateCredentials: jest.fn(),
      validateUserSession: jest.fn(),
      validateSession: jest.fn(),
      deleteSession: jest.fn(),
      createGame: jest.fn(),
      getGame: jest.fn(),
      updateGame: jest.fn(),
      getGameList: jest.fn(),
      joinGame: jest.fn(),
    };

    mockServer = new Server();
    new WebSocketHandler(mockServer, mockDb, mockLogger);
    await mockServer.listen(8080);
  });

  afterAll(async () => {
    await mockServer.close();
  });

  beforeEach(() => {
    wsClient = new WebSocket('ws://localhost:8080');
  });

  afterEach(() => {
    wsClient.terminate();
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
      done();
    });
  });
});
