import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from './mongodb';
import { UserDocument, SessionDocument, ActivityLogDocument } from './models/User';
import { EmailService } from './email-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private static usersCollection = () => getCollection('users');
  private static sessionsCollection = () => getCollection('sessions');
  private static activityLogsCollection = () => getCollection('activityLogs');

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: UserDocument): string {
    return jwt.sign(
      { 
        userId: user._id!.toString(), 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token: string): AuthToken | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch {
      return null;
    }
  }

  static async register(email: string, password: string, name: string, deviceInfo?: any): Promise<{ success: boolean; message: string; user?: UserDocument }> {
    const collection = await this.usersCollection();
    
    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Validate password strength
    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long' };
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const hashedPassword = await this.hashPassword(password);
    const verificationToken = uuidv4();

    const newUser: UserDocument = {
      email,
      password: hashedPassword,
      profile: {
        firstName,
        lastName
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
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
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
        ipAddress: deviceInfo?.ipAddress,
        userAgent: deviceInfo?.userAgent,
      },
    };

    const result = await collection.insertOne(newUser);
    const user = { ...newUser, _id: result.insertedId };

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    // Log activity
    await this.logActivity(
      result.insertedId,
      'user_registered',
      'auth',
      { description: 'User registered successfully' },
      'success'
    );

    return { success: true, message: 'Registration successful. Please check your email for verification.', user };
  }

  static async login(email: string, password: string, deviceInfo?: any): Promise<{ success: boolean; message: string; token?: string; user?: UserDocument }> {
    const collection = await this.usersCollection();
    const user = await collection.findOne({ email }) as UserDocument | null;
    
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    if (!user.status.isActive) {
      return { success: false, message: 'Account is suspended' };
    }

    // Check if account is locked
    if (user.authentication.lockedUntil && user.authentication.lockedUntil > new Date()) {
      return { success: false, message: 'Account is temporarily locked. Please try again later.' };
    }

    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      // Increment failed login attempts
      await collection.updateOne(
        { _id: user._id },
        { 
          $inc: { 'authentication.failedLoginAttempts': 1 },
          $set: { 
            'metadata.updatedAt': new Date(),
            ...(user.authentication.failedLoginAttempts >= 4 && {
              'authentication.lockedUntil': new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            })
          }
        }
      );
      
      await this.logActivity(
        user._id!,
        'login_failed',
        'auth',
        { description: 'Failed login attempt' },
        'failure'
      );

      return { success: false, message: 'Invalid credentials' };
    }

    if (!user.authentication.isVerified) {
      return { success: false, message: 'Please verify your email before logging in' };
    }

    // Reset failed login attempts and update last login
    await collection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          'status.lastLogin': new Date(),
          'status.lastActivity': new Date(),
          'authentication.failedLoginAttempts': 0,
          'metadata.updatedAt': new Date()
        },
        $unset: { 'authentication.lockedUntil': 1 }
      }
    );

    const token = this.generateToken(user);

    // Create session
    if (deviceInfo) {
      await this.createSession(user._id!, deviceInfo, token);
    }

    // Log activity
    await this.logActivity(
      user._id!,
      'user_login',
      'auth',
      { description: 'User logged in successfully' },
      'success'
    );

    return { success: true, message: 'Login successful', token, user };
  }

  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const collection = await this.usersCollection();
    const user = await collection.findOne({ 
      'authentication.verificationToken': token,
      'authentication.verificationTokenExpiry': { $gt: new Date() }
    }) as UserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid or expired verification token' };
    }

    await collection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          'authentication.isVerified': true,
          'metadata.updatedAt': new Date()
        },
        $unset: { 
          'authentication.verificationToken': 1,
          'authentication.verificationTokenExpiry': 1
        }
      }
    );

    await this.logActivity(
      user._id!,
      'email_verified',
      'auth',
      { description: 'Email verified successfully' },
      'success'
    );

    return { success: true, message: 'Email verified successfully' };
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const collection = await this.usersCollection();
    const user = await collection.findOne({ email }) as UserDocument | null;
    
    if (!user) {
      // Don't reveal if user exists
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await collection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          'authentication.resetToken': resetToken,
          'authentication.resetTokenExpiry': resetTokenExpiry,
          'metadata.updatedAt': new Date()
        }
      }
    );

    try {
      await EmailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    await this.logActivity(
      user._id!,
      'password_reset_requested',
      'auth',
      { description: 'Password reset requested' },
      'success'
    );

    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const collection = await this.usersCollection();
    const user = await collection.findOne({ 
      'authentication.resetToken': token,
      'authentication.resetTokenExpiry': { $gt: new Date() }
    }) as UserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long' };
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await collection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          'authentication.lastPasswordChange': new Date(),
          'metadata.updatedAt': new Date()
        },
        $unset: { 
          'authentication.resetToken': 1,
          'authentication.resetTokenExpiry': 1
        }
      }
    );

    await this.logActivity(
      user._id!,
      'password_reset',
      'auth',
      { description: 'Password reset successfully' },
      'success'
    );

    return { success: true, message: 'Password reset successfully' };
  }

  static async createSession(userId: ObjectId, deviceInfo: any, sessionToken: string): Promise<SessionDocument> {
    const collection = await this.sessionsCollection();
    
    const session: SessionDocument = {
      userId,
      sessionToken,
      deviceInfo: {
        userAgent: deviceInfo.userAgent || '',
        ipAddress: deviceInfo.ipAddress || '',
        location: deviceInfo.location,
        deviceType: this.detectDeviceType(deviceInfo.userAgent),
        browser: this.detectBrowser(deviceInfo.userAgent),
        os: this.detectOS(deviceInfo.userAgent),
      },
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

  static async getUserById(id: string | ObjectId): Promise<UserDocument | null> {
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

  static async canUserUseAI(userId: string): Promise<{ canUse: boolean; reason?: string }> {
    const user = await this.getUserById(userId);
    if (!user) {
      return { canUse: false, reason: 'User not found' };
    }

    if (!user.status.isActive) {
      return { canUse: false, reason: 'Account is suspended' };
    }

    if (user.status.isSuspended) {
      return { canUse: false, reason: 'Account is suspended' };
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(user.usage.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    if (today.getTime() !== lastReset.getTime()) {
      // Reset daily usage
      await this.updateUser(userId, {
        'usage.dailyCount': 0,
        'usage.lastResetDate': today,
      });
      user.usage.dailyCount = 0;
    }

    if (user.usage.dailyCount >= user.usage.dailyLimit) {
      return { canUse: false, reason: 'Daily usage limit exceeded' };
    }

    return { canUse: true };
  }

  static async updateUsage(userId: string, toolName: string, success: boolean = true): Promise<void> {
    const collection = await this.usersCollection();
    const objectId = new ObjectId(userId);

    await collection.updateOne(
      { _id: objectId },
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

    // Log activity
    await this.logActivity(
      objectId,
      'tool_used',
      'tool_usage',
      { 
        toolName,
        description: `Used ${toolName}`,
        metadata: { success }
      },
      success ? 'success' : 'failure'
    );
  }

  // Helper methods
  private static detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private static detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private static detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}