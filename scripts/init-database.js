require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'devtoolkit';

async function initializeDatabase() {
  let client;

  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);

    // Create collections
    const collections = [
      'users',
      'sessions',
      'tools',
      'usageAnalytics',
      'systemAnalytics',
      'realTimeMetrics',
      'suggestions',
      'systemConfig',
      'activityLogs',
    ];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }

    // Create indexes
    console.log('Creating indexes...');

    // Users collection
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { 'authentication.verificationToken': 1 }, sparse: true },
      { key: { 'authentication.resetToken': 1 }, sparse: true },
      { key: { role: 1 } },
      { key: { 'status.isActive': 1 } },
      { key: { 'metadata.createdAt': 1 } },
      { key: { 'status.lastLogin': 1 } },
      { key: { 'preferences.theme': 1 } }
    ]);

    // Sessions collection
    await db.collection('sessions').createIndexes([
      { key: { userId: 1 } },
      { key: { sessionToken: 1 }, unique: true },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      { key: { createdAt: 1 } }
    ]);

    // Tools collection
    await db.collection('tools').createIndexes([
      { key: { slug: 1 }, unique: true },
      { key: { category: 1 } },
      { key: { 'configuration.isActive': 1 } },
      { key: { 'features.aiPowered': 1 } },
      { key: { 'metadata.version': 1 } },
      { key: { 'timestamps.createdAt': 1 } }
    ]);

    // Usage Analytics collection
    await db.collection('usageAnalytics').createIndexes([
      { key: { userId: 1 } },
      { key: { toolId: 1 } },
      { key: { timestamp: 1 } },
      { key: { userId: 1, timestamp: 1 } },
      { key: { toolId: 1, timestamp: 1 } },
      { key: { 'usage.success': 1 } },
      { key: { timestamp: 1 }, expireAfterSeconds: 31536000 } // 1 year TTL
    ]);

    // Suggestions collection
    await db.collection('suggestions').createIndexes([
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { type: 1 } },
      { key: { 'metadata.createdAt': 1 } },
      { key: { priority: 1 } }
    ]);

    // System Analytics collection
    await db.collection('systemAnalytics').createIndexes([
      { key: { date: 1 }, unique: true },
      { key: { 'metrics.totalUsers': 1 } },
      { key: { 'metrics.activeUsers': 1 } },
      { key: { createdAt: 1 } }
    ]);

    // System Configuration collection
    await db.collection('systemConfig').createIndexes([
      { key: { key: 1 }, unique: true },
      { key: { category: 1 } },
      { key: { isActive: 1 } },
      { key: { updatedAt: 1 } }
    ]);

    // Activity Logs collection
    await db.collection('activityLogs').createIndexes([
      { key: { userId: 1 } },
      { key: { action: 1 } },
      { key: { timestamp: 1 } },
      { key: { userId: 1, timestamp: 1 } },
      { key: { level: 1 } },
      { key: { timestamp: 1 }, expireAfterSeconds: 7776000 } // 90 days TTL
    ]);

    console.log('Database indexes created successfully');

    // Create admin user if it doesn't exist
    const adminUser = await db.collection('users').findOne({ email: 'admin@devtoolkit.com' });
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.collection('users').insertOne({
        email: 'admin@devtoolkit.com',
        password: hashedPassword,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
        },
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            marketing: false,
          },
          privacy: {
            profileVisibility: 'private',
            showActivity: false,
          },
        },
        authentication: {
          isVerified: true,
          failedLoginAttempts: 0,
        },
        role: 'admin',
        subscription: {
          plan: 'enterprise',
          status: 'active',
          features: ['all_tools', 'unlimited_usage', 'admin_access'],
        },
        usage: {
          dailyCount: 0,
          monthlyCount: 0,
          totalCount: 0,
          dailyLimit: 1000,
          monthlyLimit: 10000,
          lastResetDate: new Date(),
        },
        status: {
          isActive: true,
          isSuspended: false,
          lastLogin: new Date(),
          lastActivity: new Date(),
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'system',
        },
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Create demo tools if they don't exist
    const toolsCount = await db.collection('tools').countDocuments();
    
    if (toolsCount === 0) {
      const tools = [
        {
          name: 'AI SQL Query Generator',
          slug: 'ai-sql-query-generator',
          description: 'Generate complex SQL queries from natural language using Gemini AI',
          category: 'ai-powered',
          subcategory: 'database',
          tags: ['sql', 'ai', 'database', 'gemini', 'natural language'],
          metadata: {
            version: '1.0.0',
            author: 'DevToolkit Team',
            license: 'MIT',
          },
          features: {
            aiPowered: true,
            realTime: true,
            collaborative: false,
            offline: false,
            apiAccess: true,
          },
          configuration: {
            isActive: true,
            isPublic: true,
            isFeatured: true,
            requiresAuth: true,
            requiresPro: false,
            maintenanceMode: false,
          },
          usage: {
            totalUsage: 0,
            dailyUsage: 0,
            weeklyUsage: 0,
            monthlyUsage: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          performance: {
            averageResponseTime: 0,
            uptime: 100,
            errorRate: 0,
            lastHealthCheck: new Date(),
          },
          ui: {
            icon: 'database',
            color: '#3B82F6',
          },
          dependencies: {
            external: ['@google/generative-ai'],
            internal: [],
          },
          limits: {
            dailyLimit: 50,
            monthlyLimit: 1000,
            rateLimitPerMinute: 10,
          },
          timestamps: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          name: 'AI Bug Finder',
          slug: 'ai-bug-finder',
          description: 'Paste code and highlight potential issues or bad practices using AI analysis',
          category: 'ai-powered',
          subcategory: 'development',
          tags: ['code', 'bugs', 'analysis', 'security', 'quality'],
          metadata: {
            version: '1.0.0',
            author: 'DevToolkit Team',
            license: 'MIT',
          },
          features: {
            aiPowered: true,
            realTime: true,
            collaborative: false,
            offline: false,
            apiAccess: true,
          },
          configuration: {
            isActive: true,
            isPublic: true,
            isFeatured: true,
            requiresAuth: true,
            requiresPro: false,
            maintenanceMode: false,
          },
          usage: {
            totalUsage: 0,
            dailyUsage: 0,
            weeklyUsage: 0,
            monthlyUsage: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          performance: {
            averageResponseTime: 0,
            uptime: 100,
            errorRate: 0,
            lastHealthCheck: new Date(),
          },
          ui: {
            icon: 'bug',
            color: '#EF4444',
          },
          dependencies: {
            external: ['@google/generative-ai'],
            internal: [],
          },
          limits: {
            dailyLimit: 50,
            monthlyLimit: 1000,
            rateLimitPerMinute: 10,
          },
          timestamps: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          name: 'Learning Assistant',
          slug: 'learning-assistant',
          description: 'Ask tech questions inside the DevToolkit interface with AI-powered answers',
          category: 'ai-powered',
          subcategory: 'education',
          tags: ['learning', 'questions', 'education', 'assistance'],
          metadata: {
            version: '1.0.0',
            author: 'DevToolkit Team',
            license: 'MIT',
          },
          features: {
            aiPowered: true,
            realTime: true,
            collaborative: false,
            offline: false,
            apiAccess: true,
          },
          configuration: {
            isActive: true,
            isPublic: true,
            isFeatured: true,
            requiresAuth: true,
            requiresPro: false,
            maintenanceMode: false,
          },
          usage: {
            totalUsage: 0,
            dailyUsage: 0,
            weeklyUsage: 0,
            monthlyUsage: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          performance: {
            averageResponseTime: 0,
            uptime: 100,
            errorRate: 0,
            lastHealthCheck: new Date(),
          },
          ui: {
            icon: 'brain',
            color: '#8B5CF6',
          },
          dependencies: {
            external: ['@google/generative-ai'],
            internal: [],
          },
          limits: {
            dailyLimit: 50,
            monthlyLimit: 1000,
            rateLimitPerMinute: 10,
          },
          timestamps: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];
      
      await db.collection('tools').insertMany(tools);
      console.log('Demo tools created successfully');
    } else {
      console.log('Tools already exist');
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

initializeDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });