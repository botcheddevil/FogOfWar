import { MongoClient, Binary } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, Game, GameStatus, GameResult, Move } from './types';

export class Db {
  private client: MongoClient;
  private readonly userCollection = 'users';
  private readonly gameCollection = 'games';

  constructor(mongoUri: string) {
    this.client = new MongoClient(mongoUri);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  async createUser(email: string, password: string): Promise<string> {
    try {
      const collection = this.client.db().collection<User>(this.userCollection);

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

  async validateCredentials(email: string, password: string): Promise<boolean> {
    try {
      const collection = this.client.db().collection<User>(this.userCollection);
      const user = await collection.findOne({ email });

      if (!user) {
        return false;
      }

      return bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Failed to validate credentials:', error);
      throw error;
    }
  }

  async createGame(
    playerWhite: string,
    playerBlack: string,
    initialState: Uint8Array,
  ): Promise<string> {
    try {
      const collection = this.client.db().collection<Game>(this.gameCollection);

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
      console.error('Failed to create game:', error);
      throw error;
    }
  }

  async getGameState(
    gameId: string,
  ): Promise<{ game: Game; state: Uint8Array } | null> {
    try {
      const collection = this.client.db().collection<Game>(this.gameCollection);
      const game = await collection.findOne({ udid: gameId });

      if (!game) {
        return null;
      }

      return {
        game,
        state: new Uint8Array(game.gameState.buffer),
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
      const collection = this.client.db().collection<Game>(this.gameCollection);

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
      const collection = this.client.db().collection<Game>(this.gameCollection);

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
      console.error('Failed to get game list:', error);
      throw error;
    }
  }
}
