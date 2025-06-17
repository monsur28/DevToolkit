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

    const { userId, isActive, isSuspended, suspensionReason } = await request.json();

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'User ID and status are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      'status.isActive': isActive,
      'metadata.updatedAt': new Date()
    };

    if (typeof isSuspended === 'boolean') {
      updateData['status.isSuspended'] = isSuspended;
      if (isSuspended && suspensionReason) {
        updateData['status.suspensionReason'] = suspensionReason;
      } else if (!isSuspended) {
        updateData['$unset'] = { 'status.suspensionReason': 1 };
      }
    }

    const success = await AuthService.updateUser(userId, updateData);

    if (success) {
      // Log admin action
      await AuthService.logActivity(
        new ObjectId(decoded.userId),
        'user_status_updated',
        'admin',
        { 
          description: `Updated user status: ${userId}`,
          metadata: { targetUserId: userId, isActive, isSuspended, suspensionReason }
        },
        'success'
      );

      return NextResponse.json({
        success: true,
        message: 'User status updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update user status' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}