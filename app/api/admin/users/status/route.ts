import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

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

    const { userId, isActive } = await request.json();

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'User ID and status are required' },
        { status: 400 }
      );
    }

    AuthService.updateUserStatus(userId, isActive);
    
    return NextResponse.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}