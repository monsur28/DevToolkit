import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';
import { AnalyticsService } from '@/lib/services/AnalyticsService';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get today's date for analytics
    const today = new Date().toISOString().split('T')[0];
    
    // Generate or get today's analytics
    const analytics = await AnalyticsService.generateDailyAnalytics(today);
    
    // Get additional real-time metrics
    const usersCollection = await getCollection('users');
    const usageCollection = await getCollection('usageAnalytics');
    const suggestionsCollection = await getCollection('suggestions');
    
    // Get user counts
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({ 'status.isActive': true });
    const verifiedUsers = await usersCollection.countDocuments({ 'authentication.isVerified': true });
    
    // Get usage stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsage = await usageCollection
      .find({ timestamp: { $gte: thirtyDaysAgo } })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    // Get tool usage stats
    const toolUsage = await usageCollection.aggregate([
      {
        $match: { timestamp: { $gte: thirtyDaysAgo } }
      },
      {
        $lookup: {
          from: 'tools',
          localField: 'toolId',
          foreignField: '_id',
          as: 'tool'
        }
      },
      {
        $group: {
          _id: '$toolId',
          toolName: { $first: { $arrayElemAt: ['$tool.name', 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Get suggestion stats
    const pendingSuggestions = await suggestionsCollection.countDocuments({ status: 'pending' });
    
    const enhancedAnalytics = {
      ...analytics,
      realTimeMetrics: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        pendingSuggestions,
        toolUsage: toolUsage.reduce((acc, tool) => {
          acc[tool.toolName || 'Unknown'] = tool.count;
          return acc;
        }, {} as Record<string, number>),
        recentUsage: recentUsage.map(usage => ({
          toolName: 'Tool Usage',
          timestamp: usage.timestamp,
          success: usage.usage?.success || false
        }))
      }
    };
    
    return NextResponse.json({
      success: true,
      analytics: enhancedAnalytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}