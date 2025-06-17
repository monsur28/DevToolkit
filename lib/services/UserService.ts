import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from '../mongodb';
import { UserDocument, SessionDocument, ActivityLogDocument } from '../models/User';

export class UserService {
  private static usersCollection = () => getCollection('users');
  private static sessionsCollection = () => getCollection('sessions');
  private static activityLogsCollection = () => getCollection('activityLogs');

  static async createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
    const collection = await this.usersCollection();
    
    const hashedPassword = await bcrypt.hash(userData.password!, 12);
    
    const user: UserDocument = {
      email: userData.email!,
      password: hashedPassword,
      profile: {
        firstName: userData.profile?.firstName,
        lastName: userData.profile?.lastName,
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
        isVerified: false,
        failedLoginAttempts: 0,
      },
      role: 'user',
      subscription: {
        plan: 'free',
        status: 'active',
        features: ['basic_tools'],
      },
      usage: {
        dailyCount: 0,
        monthlyCount: 0,
        totalCount: 0,
        dailyLimit: 50,
        monthlyLimit: 1000,
        lastResetDate: new Date(),
      },
      status: {
        isActive: true,
        isSuspended: false,
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'web',
      },
    };

    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async findUserByEmail(email: string): Promise<UserDocument | null> {
    const collection = await this.usersCollection();
    return await collection.findOne({ email }) as UserDocument | null;
  }

  static async findUserById(id: string | ObjectId): Promise<UserDocument | null> {
    const collection = await this.usersCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId }) as UserDocument | null;
  }

  static async updateUser(id: string | ObjectId, updates: Partial<UserDocument>): Promise<boolean> {
    const collection = await this.usersCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          ...updates, 
          'metadata.updatedAt': new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async createSession(userId: ObjectId, deviceInfo: any): Promise<SessionDocument> {
    const collection = await this.sessionsCollection();
    
    const session: SessionDocument = {
      userId,
      sessionToken: jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' }),
      deviceInfo,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };

    const result = await collection.insertOne(session);
    return { ...session, _id: result.insertedId };
  }

  static async logActivity(
    userId: ObjectId,
    action: string,
    category: ActivityLogDocument['category'],
    details: ActivityLogDocument['details'],
    result: ActivityLogDocument['result'] = 'success'
  ): Promise<void> {
    const collection = await this.activityLogsCollection();
    
    const log: ActivityLogDocument = {
      userId,
      action,
      category,
      details,
      result,
      level: result === 'success' ? 'info' : result === 'failure' ? 'error' : 'warn',
      timestamp: new Date(),
    };

    await collection.insertOne(log);
  }

  static async updateUsage(userId: ObjectId, toolId?: ObjectId): Promise<void> {
    const collection = await this.usersCollection();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await collection.updateOne(
      { _id: userId },
      {
        $inc: {
          'usage.dailyCount': 1,
          'usage.monthlyCount': 1,
          'usage.totalCount': 1,
        },
        $set: {
          'usage.lastUsageDate': new Date(),
          'status.lastActivity': new Date(),
          'metadata.updatedAt': new Date(),
        },
      }
    );
  }

  static async resetDailyUsage(): Promise<void> {
    const collection = await this.usersCollection();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await collection.updateMany(
      { 'usage.lastResetDate': { $lt: today } },
      {
        $set: {
          'usage.dailyCount': 0,
          'usage.lastResetDate': today,
          'metadata.updatedAt': new Date(),
        },
      }
    );
  }
}