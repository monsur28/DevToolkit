import { ObjectId } from 'mongodb';

export interface UsageAnalyticsDocument {
  _id?: ObjectId;
  userId: ObjectId;
  toolId: ObjectId;
  sessionId?: ObjectId;
  usage: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    inputSize?: number;
    outputSize?: number;
    success: boolean;
    errorMessage?: string;
  };
  context: {
    userAgent: string;
    ipAddress: string;
    referrer?: string;
    location?: {
      country: string;
      region: string;
      city: string;
    };
  };
  performance: {
    responseTime: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  metadata: {
    version: string;
    features: string[];
    customData?: Record<string, any>;
  };
  timestamp: Date;
}

export interface SystemAnalyticsDocument {
  _id?: ObjectId;
  date: string; // YYYY-MM-DD format
  metrics: {
    users: {
      total: number;
      active: number;
      new: number;
      verified: number;
      premium: number;
    };
    tools: {
      totalUsage: number;
      uniqueUsers: number;
      averageSessionDuration: number;
      mostUsedTools: Array<{
        toolId: ObjectId;
        toolName: string;
        usageCount: number;
      }>;
    };
    performance: {
      averageResponseTime: number;
      errorRate: number;
      uptime: number;
      peakConcurrentUsers: number;
    };
    engagement: {
      pageViews: number;
      bounceRate: number;
      averageSessionDuration: number;
      returnUserRate: number;
    };
  };
  trends: {
    userGrowth: number;
    usageGrowth: number;
    performanceChange: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeMetricsDocument {
  _id?: ObjectId;
  timestamp: Date;
  metrics: {
    activeUsers: number;
    concurrentSessions: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    threshold: number;
    currentValue: number;
  }>;
}