import { ObjectId } from 'mongodb';

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  password: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    website?: string;
    location?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showActivity: boolean;
    };
  };
  authentication: {
    isVerified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    resetToken?: string;
    resetTokenExpiry?: Date;
    lastPasswordChange?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
  };
  role: 'user' | 'admin' | 'moderator';
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
    features: string[];
  };
  usage: {
    dailyCount: number;
    monthlyCount: number;
    totalCount: number;
    dailyLimit: number;
    monthlyLimit: number;
    lastResetDate: Date;
    lastUsageDate?: Date;
  };
  status: {
    isActive: boolean;
    isSuspended: boolean;
    suspensionReason?: string;
    lastLogin?: Date;
    lastActivity?: Date;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: ObjectId;
    source: 'web' | 'api' | 'admin';
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface SessionDocument {
  _id?: ObjectId;
  userId: ObjectId;
  sessionToken: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    location?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
  };
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface ActivityLogDocument {
  _id?: ObjectId;
  userId: ObjectId;
  action: string;
  category: 'auth' | 'tool_usage' | 'profile' | 'admin' | 'system';
  details: {
    toolId?: ObjectId;
    toolName?: string;
    description: string;
    metadata?: Record<string, any>;
  };
  result: 'success' | 'failure' | 'warning';
  level: 'info' | 'warn' | 'error' | 'debug';
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}