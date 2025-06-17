import { ObjectId } from 'mongodb';
import { getCollection } from '../mongodb';
import { UsageAnalyticsDocument, SystemAnalyticsDocument, RealTimeMetricsDocument } from '../models/Analytics';

export class AnalyticsService {
  private static usageCollection = () => getCollection('usageAnalytics');
  private static systemCollection = () => getCollection('systemAnalytics');
  private static realTimeCollection = () => getCollection('realTimeMetrics');

  static async trackUsage(data: Omit<UsageAnalyticsDocument, '_id' | 'timestamp'>): Promise<void> {
    const collection = await this.usageCollection();
    
    const usage: UsageAnalyticsDocument = {
      ...data,
      timestamp: new Date(),
    };

    await collection.insertOne(usage);
  }

  static async getDailyAnalytics(date: string): Promise<SystemAnalyticsDocument | null> {
    const collection = await this.systemCollection();
    return await collection.findOne({ date }) as SystemAnalyticsDocument | null;
  }

  static async generateDailyAnalytics(date: string): Promise<SystemAnalyticsDocument> {
    const usersCollection = await getCollection('users');
    const usageCollection = await this.usageCollection();
    const systemCollection = await this.systemCollection();

    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Aggregate user metrics
    const userMetrics = await usersCollection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status.isActive', true] }, 1, 0]
            }
          },
          verified: {
            $sum: {
              $cond: [{ $eq: ['$authentication.isVerified', true] }, 1, 0]
            }
          },
          premium: {
            $sum: {
              $cond: [{ $ne: ['$subscription.plan', 'free'] }, 1, 0]
            }
          },
          new: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$metadata.createdAt', startDate] },
                    { $lt: ['$metadata.createdAt', endDate] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    // Aggregate usage metrics
    const usageMetrics = await usageCollection.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          averageResponseTime: { $avg: '$performance.responseTime' },
          successRate: {
            $avg: {
              $cond: ['$usage.success', 1, 0]
            }
          }
        }
      },
      {
        $project: {
          totalUsage: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          averageResponseTime: 1,
          errorRate: { $subtract: [1, '$successRate'] }
        }
      }
    ]).toArray();

    // Get most used tools
    const mostUsedTools = await usageCollection.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: '$toolId',
          usageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'tools',
          localField: '_id',
          foreignField: '_id',
          as: 'tool'
        }
      },
      {
        $project: {
          toolId: '$_id',
          toolName: { $arrayElemAt: ['$tool.name', 0] },
          usageCount: 1
        }
      },
      { $sort: { usageCount: -1 } },
      { $limit: 10 }
    ]).toArray();

    const analytics: SystemAnalyticsDocument = {
      date,
      metrics: {
        users: userMetrics[0] || {
          total: 0,
          active: 0,
          new: 0,
          verified: 0,
          premium: 0
        },
        tools: {
          totalUsage: usageMetrics[0]?.totalUsage || 0,
          uniqueUsers: usageMetrics[0]?.uniqueUsers || 0,
          averageSessionDuration: 0, // Calculate separately if needed
          mostUsedTools: mostUsedTools || []
        },
        performance: {
          averageResponseTime: usageMetrics[0]?.averageResponseTime || 0,
          errorRate: usageMetrics[0]?.errorRate || 0,
          uptime: 99.9, // Calculate from monitoring data
          peakConcurrentUsers: 0 // Calculate from real-time metrics
        },
        engagement: {
          pageViews: 0, // Integrate with web analytics
          bounceRate: 0,
          averageSessionDuration: 0,
          returnUserRate: 0
        }
      },
      trends: {
        userGrowth: 0, // Calculate compared to previous day
        usageGrowth: 0,
        performanceChange: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await systemCollection.replaceOne(
      { date },
      analytics,
      { upsert: true }
    );

    return analytics;
  }

  static async getUsageByTool(toolId: ObjectId, days: number = 30): Promise<any[]> {
    const collection = await this.usageCollection();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await collection.aggregate([
      {
        $match: {
          toolId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: ['$usage.success', 1, 0]
            }
          },
          averageResponseTime: { $avg: '$performance.responseTime' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
  }

  static async updateRealTimeMetrics(metrics: Omit<RealTimeMetricsDocument, '_id' | 'timestamp'>): Promise<void> {
    const collection = await this.realTimeCollection();
    
    const realTimeMetrics: RealTimeMetricsDocument = {
      ...metrics,
      timestamp: new Date(),
    };

    await collection.insertOne(realTimeMetrics);

    // Keep only last 24 hours of real-time metrics
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);
    
    await collection.deleteMany({
      timestamp: { $lt: cutoffTime }
    });
  }
}