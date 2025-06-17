import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AuthService } from '@/lib/auth-service';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const usageCollection = await getCollection('usageAnalytics');
    const toolsCollection = await getCollection('tools');
    
    // Get usage history with tool names
    const history = await usageCollection.aggregate([
      { 
        $match: { 
          userId: new ObjectId(decoded.userId) 
        } 
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
        $project: {
          _id: 1,
          toolName: { 
            $cond: [
              { $gt: [{ $size: '$tool' }, 0] },
              { $arrayElemAt: ['$tool.name', 0] },
              'Unknown Tool'
            ]
          },
          timestamp: '$timestamp',
          success: '$usage.success'
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: 50 }
    ]).toArray();
    
    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Usage history error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}