import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
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

    const { userId, dailyLimit, monthlyLimit } = await request.json();

    if (!userId || !dailyLimit || !monthlyLimit) {
      return NextResponse.json(
        { success: false, message: 'User ID and limits are required' },
        { status: 400 }
      );
    }

    const success = await AuthService.updateUser(userId, {
      'usage.dailyLimit': dailyLimit,
      'usage.monthlyLimit': monthlyLimit,
      'metadata.updatedAt': new Date()
    });

    if (success) {
      // Log admin action
      await AuthService.logActivity(
        new ObjectId(decoded.userId),
        'user_limits_updated',
        'admin',
        { 
          description: `Updated user limits: ${userId}`,
          metadata: { targetUserId: userId, dailyLimit, monthlyLimit }
        },
        'success'
      );

      return NextResponse.json({
        success: true,
        message: 'User limits updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update user limits' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update user limits error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}