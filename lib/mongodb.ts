import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'devtoolkit';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedConnection = { client, db };
    
    console.log('Connected to MongoDB');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getCollection(collectionName: string): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Database initialization and indexing
export async function initializeDatabase(): Promise<void> {
  const { db } = await connectToDatabase();

  try {
    // Create indexes for Users collection
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { verificationToken: 1 }, sparse: true },
      { key: { resetToken: 1 }, sparse: true },
      { key: { role: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: 1 } },
      { key: { lastLogin: 1 } },
      { key: { 'preferences.theme': 1 } }
    ]);

    // Create indexes for Sessions collection
    await db.collection('sessions').createIndexes([
      { key: { userId: 1 } },
      { key: { sessionToken: 1 }, unique: true },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      { key: { createdAt: 1 } }
    ]);

    // Create indexes for Tools collection
    await db.collection('tools').createIndexes([
      { key: { slug: 1 }, unique: true },
      { key: { category: 1 } },
      { key: { isActive: 1 } },
      { key: { aiPowered: 1 } },
      { key: { 'metadata.version': 1 } },
      { key: { createdAt: 1 } }
    ]);

    // Create indexes for Usage Analytics collection
    await db.collection('usageAnalytics').createIndexes([
      { key: { userId: 1 } },
      { key: { toolId: 1 } },
      { key: { timestamp: 1 } },
      { key: { userId: 1, timestamp: 1 } },
      { key: { toolId: 1, timestamp: 1 } },
      { key: { success: 1 } },
      { key: { timestamp: 1 }, expireAfterSeconds: 31536000 } // 1 year TTL
    ]);

    // Create indexes for Suggestions collection
    await db.collection('suggestions').createIndexes([
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { type: 1 } },
      { key: { createdAt: 1 } },
      { key: { priority: 1 } }
    ]);

    // Create indexes for System Analytics collection
    await db.collection('systemAnalytics').createIndexes([
      { key: { date: 1 }, unique: true },
      { key: { 'metrics.totalUsers': 1 } },
      { key: { 'metrics.activeUsers': 1 } },
      { key: { createdAt: 1 } }
    ]);

    // Create indexes for System Configuration collection
    await db.collection('systemConfig').createIndexes([
      { key: { key: 1 }, unique: true },
      { key: { category: 1 } },
      { key: { isActive: 1 } },
      { key: { updatedAt: 1 } }
    ]);

    // Create indexes for Activity Logs collection
    await db.collection('activityLogs').createIndexes([
      { key: { userId: 1 } },
      { key: { action: 1 } },
      { key: { timestamp: 1 } },
      { key: { userId: 1, timestamp: 1 } },
      { key: { level: 1 } },
      { key: { timestamp: 1 }, expireAfterSeconds: 7776000 } // 90 days TTL
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
    throw error;
  }
}