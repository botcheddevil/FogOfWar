import { MongoClient, Binary, MongoClientOptions } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, Game, GameStatus, GameResult, Move, Session } from './types';
import { ILogger } from './ILogger';

export class Db {
  private client: MongoClient;
  private readonly dbName = 'chess';
  private logger: ILogger;
  private readonly userCollection = 'users';
  private readonly gameCollection = 'games';

  constructor(
    mongoUri: string,
    dbOptions: MongoClientOptions,
    logger: ILogger,
  ) {
    this.logger = logger;
    this.client = new MongoClient(mongoUri, dbOptions);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB:', { error });
      throw error;
    }
    this.logger.info('Connected to MongoDB');
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  async createUser(email: string, password: string): Promise<string> {
    try {
      const collection = this.client
        .db(this.dbName)
        .collection<User>(this.userCollection);

      const existingUser = await collection.findOne({
        email,
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user: User = {
        email,
        password: hashedPassword,
        joinedDate: new Date(),
      };

      const result = await collection.insertOne(user);
      return result.insertedId.toHexString();
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  // Updated method in database.ts
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<{ valid: boolean; sessionId?: string }> {
    try {
      const userCollection = this.client
        .db(this.dbName)
        .collection<User>(this.userCollection);
      const sessionCollection = this.client
        .db(this.dbName)
        .collection<Session>('sessions');

      const user = await userCollection.findOne({ email });

      if (!user) {
        return { valid: false };
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return { valid: false };
      }

      // Generate new session
      const sessionId = uuidv4();
      const session: Session = {
        userId: user._id!.toString(),
        sessionId,
        email,
        createdAt: new Date(),
        lastActive: new Date(),
      };

      await sessionCollection.insertOne(session);

      return {
        valid: true,
        sessionId,
      };
    } catch (error) {
      console.error('Failed to validate credentials:', error);
      throw error;
    }
  }

  async validateUserSession(
    sessionId: string,
    email: string,
  ): Promise<string | null> {
    try {
      const sessionCollection = this.client
        .db(this.dbName)
        .collection<Session>('sessions');

      const session = await sessionCollection.findOne({
        sessionId,
        email,
      });

      if (!session) {
        return null;
      }

      // Update last active timestamp
      await sessionCollection.updateOne(
        { sessionId },
        { $set: { lastActive: new Date() } },
      );

      return session.email;
    } catch (error) {
      console.error('Failed to validate session:', error);
      throw error;
    }
  }

  async validateSession(sessionId: string, gameId: string): Promise<boolean> {
    try {
      const sessionCollection = this.client
        .db(this.dbName)
        .collection<Session>('sessions');

      const session = await sessionCollection.findOne({
        sessionId,
      });

      if (!session) {
        this.logger.warn(`Session ${sessionId} not found`);
        return false;
      }

      // Update last active timestamp
      await sessionCollection.updateOne(
        { sessionId },
        { $set: { lastActive: new Date() } },
      );

      const gameCollection = this.client
        .db(this.dbName)
        .collection<Game>(this.gameCollection);

      const game = await gameCollection.findOne({
        udid: gameId,
        $or: [{ playerWhite: session.email }, { playerBlack: session.email }],
      });

      if (!game) {
        this.logger.warn(`Game ${gameId} not found`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to validate session:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionCollection = this.client
        .db(this.dbName)
        .collection<Session>('sessions');

      const result = await sessionCollection.deleteOne({ sessionId });

      // Return true if a session was actually deleted
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  async createGame(
    playerWhite: string,
    playerBlack: string,
    initialState: Uint8Array,
  ): Promise<string> {
    try {
      const collection = this.client
        .db(this.dbName)
        .collection<Game>(this.gameCollection);

      const game: Game = {
        udid: uuidv4(),
        playerWhite,
        playerBlack,
        createdDate: new Date(),
        moves: [],
        gameState: new Binary(Buffer.from(initialState)),
        status: GameStatus.NEW,
        result: GameResult.ONGOING,
      };

      await collection.insertOne(game);
      return game.udid;
    } catch (error) {
      this.logger.error('Failed to create game:', { error });
      throw error;
    }
  }

  async getGameState(
    gameId: string,
  ): Promise<{ game: Game; state: Uint8Array } | null> {
    try {
      const collection = this.client
        .db(this.dbName)
        .collection<Game>(this.gameCollection);
      const game = await collection.findOne({ udid: gameId });

      if (!game) {
        return null;
      }

      const binary = new Uint8Array(game.gameState.buffer);

      return {
        game,
        state: binary,
      };
    } catch (error) {
      console.error('Failed to get game state:', error);
      throw error;
    }
  }

  async updateGameState(
    gameId: string,
    newState: Uint8Array,
    move: Move,
    status?: GameStatus,
    finalResult?: GameResult,
  ): Promise<boolean> {
    try {
      const collection = this.client
        .db(this.dbName)
        .collection<Game>(this.gameCollection);

      const updateDoc: Partial<Game> = {
        gameState: new Binary(Buffer.from(newState)),
        status: status || GameStatus.IN_PROGRESS,
      };

      if (finalResult) {
        updateDoc.result = finalResult;
      }

      const result = await collection.updateOne(
        { udid: gameId },
        {
          $set: updateDoc,
          $push: { moves: move },
        },
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Failed to update game state:', error);
      throw error;
    }
  }

  async getGameList(
    email: string,
    status?: GameStatus[],
    page: number = 1,
    limit: number = 10,
  ): Promise<{ games: Game[]; total: number }> {
    try {
      const collection = this.client
        .db(this.dbName)
        .collection<Game>(this.gameCollection);

      const query: any = {
        $or: [{ playerWhite: email }, { playerBlack: email }],
      };

      if (status && status.length > 0) {
        query.status = { $in: status };
      }

      const skip = (page - 1) * limit;

      const [games, total] = await Promise.all([
        collection
          .find(query)
          .sort({ createdDate: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(query),
      ]);

      return { games, total };
    } catch (error) {
      this.logger.error('Failed to get game list:', { error });
      throw error;
    }
  }

  async getGame(gameId: string): Promise<Game | null> {
    try {
      const collection = this.client
        .db(this.dbName)
        .collection<Game>(this.gameCollection);
      return collection.findOne({ udid: gameId });
    } catch (error) {
      console.error('Failed to get game:', error);
      throw error;
    }
  }

  async joinGame(gameId: string, playerBlack: string): Promise<boolean> {
    try {
      const collection = this.client
        .db(this.dbName)
        .collection<Game>(this.gameCollection);

      const game = await collection.findOne({ udid: gameId });

      if (!game) {
        this.logger.error('Game does not exist');
        return false;
      }

      if (game.playerBlack === playerBlack) {
        this.logger.error(`Player is already in game ${gameId} ${playerBlack}`);
        return true;
      }

      if (game.playerBlack !== '') {
        this.logger.error(
          `Game already has two players Black-${game.playerBlack} White-${game.playerWhite}`,
        );
        return false;
      }

      const result = await collection.updateOne(
        { udid: gameId },
        {
          $set: { playerBlack },
        },
      );
      this.logger.info(`Player ${playerBlack} joined game ${gameId}`);
      return result.modifiedCount === 1;
    } catch (error) {
      this.logger.error('Failed to join game:', { error });
      throw error;
    }
  }
}
