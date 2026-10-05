import { MongoClient, Db, Collection } from 'mongodb';
import { Feedback, Theme, User, Workspace, Report } from '@/types';
import {
  SEED_FEEDBACKS,
  SEED_THEMES,
  SEED_USERS,
  SEED_WORKSPACE,
  SEED_REPORTS,
} from '@/data/seedFeedback';

// Mask URI for safe UI/logging display (e.g. mongodb+srv://user:***@cluster.mongodb.net/loop_db)
export function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$4');
  } catch {
    return 'mongodb://***:***@hidden';
  }
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loop_db';
const defaultDbName = process.env.MONGODB_DB_NAME || 'loop_db';

interface GlobalMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const globalThis: GlobalMongo & typeof global;

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  if (process.env.NODE_ENV === 'development') {
    if (!globalThis._mongoClientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 2500, // Quick timeout so fallback works instantaneously if offline
        connectTimeoutMS: 3000,
      });
      globalThis._mongoClientPromise = client.connect().catch((err) => {
        // Clear cached promise on failure so next request can retry if DB starts up
        globalThis._mongoClientPromise = undefined;
        throw err;
      });
    }
    clientPromise = globalThis._mongoClientPromise;
  } else {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    clientPromise = client.connect();
  }

  return clientPromise;
}

/**
 * Access the active MongoDB database
 */
export async function getMongoDb(dbName: string = defaultDbName): Promise<Db | null> {
  try {
    const connectedClient = await getMongoClientPromise();
    return connectedClient.db(dbName);
  } catch (err) {
    // Return null if MongoDB is not reachable
    return null;
  }
}

/**
 * Collection accessors with TypeScript typing
 */
export async function getMongoCollection<T = any>(collectionName: string): Promise<Collection<any> | null> {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection(collectionName);
}

export async function getFeedbacksCollection(): Promise<Collection<any> | null> {
  return getMongoCollection('feedbacks');
}

export async function getThemesCollection(): Promise<Collection<any> | null> {
  return getMongoCollection('themes');
}

export async function getWorkspacesCollection(): Promise<Collection<any> | null> {
  return getMongoCollection('workspaces');
}

export async function getUsersCollection(): Promise<Collection<any> | null> {
  return getMongoCollection('users');
}

export async function getReportsCollection(): Promise<Collection<any> | null> {
  return getMongoCollection('reports');
}

/**
 * Check connection health and statistics
 */
export async function checkMongoStatus(): Promise<{
  isConnected: boolean;
  dbName: string;
  uriMasked: string;
  error?: string;
  stats?: {
    collections: string[];
    feedbacksCount: number;
    themesCount: number;
    usersCount: number;
    workspacesCount: number;
    reportsCount: number;
  };
}> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return {
        isConnected: false,
        dbName: defaultDbName,
        uriMasked: maskMongoUri(uri),
        error: 'Could not connect to MongoDB. Check if MongoDB server/daemon or MongoDB Atlas URI is active.',
      };
    }

    // Ping server
    await db.command({ ping: 1 });

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const [feedbacksCount, themesCount, usersCount, workspacesCount, reportsCount] = await Promise.all([
      db.collection('feedbacks').countDocuments().catch(() => 0),
      db.collection('themes').countDocuments().catch(() => 0),
      db.collection('users').countDocuments().catch(() => 0),
      db.collection('workspaces').countDocuments().catch(() => 0),
      db.collection('reports').countDocuments().catch(() => 0),
    ]);

    return {
      isConnected: true,
      dbName: db.databaseName,
      uriMasked: maskMongoUri(uri),
      stats: {
        collections: collectionNames,
        feedbacksCount,
        themesCount,
        usersCount,
        workspacesCount,
        reportsCount,
      },
    };
  } catch (error: any) {
    return {
      isConnected: false,
      dbName: defaultDbName,
      uriMasked: maskMongoUri(uri),
      error: error?.message || 'Connection failed',
    };
  }
}

/**
 * Populate MongoDB collections with initial seed dataset if empty
 */
export async function seedMongoDbIfEmpty(): Promise<{
  seeded: boolean;
  message: string;
  counts?: { feedbacks: number; themes: number; users: number; workspaces: number; reports: number };
}> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return { seeded: false, message: 'MongoDB not connected. Ensure MongoDB is running.' };
    }

    const feedbacksCol = db.collection('feedbacks');
    const existingCount = await feedbacksCol.countDocuments();

    if (existingCount > 0) {
      return {
        seeded: false,
        message: `Database already contains ${existingCount} feedback records. No seeding needed.`,
      };
    }

    // Seed Workspace
    const wsCol = db.collection('workspaces');
    await wsCol.updateOne(
      { id: SEED_WORKSPACE.id },
      { $set: SEED_WORKSPACE },
      { upsert: true }
    );

    // Seed Users
    const usersCol = db.collection('users');
    for (const user of SEED_USERS) {
      await usersCol.updateOne({ id: user.id }, { $set: user }, { upsert: true });
    }

    // Seed Themes
    const themesCol = db.collection('themes');
    for (const theme of SEED_THEMES) {
      await themesCol.updateOne({ id: theme.id }, { $set: theme }, { upsert: true });
    }

    // Seed Feedbacks
    for (const feedback of SEED_FEEDBACKS) {
      await feedbacksCol.updateOne({ id: feedback.id }, { $set: feedback }, { upsert: true });
    }

    // Seed Reports
    const reportsCol = db.collection('reports');
    for (const report of SEED_REPORTS) {
      await reportsCol.updateOne({ id: report.id }, { $set: report }, { upsert: true });
    }

    return {
      seeded: true,
      message: 'Successfully seeded MongoDB with enterprise feedback dataset.',
      counts: {
        feedbacks: SEED_FEEDBACKS.length,
        themes: SEED_THEMES.length,
        users: SEED_USERS.length,
        workspaces: 1,
        reports: SEED_REPORTS.length,
      },
    };
  } catch (error: any) {
    return {
      seeded: false,
      message: `Failed to seed MongoDB: ${error?.message || 'Unknown error'}`,
    };
  }
}

export default getMongoDb;
