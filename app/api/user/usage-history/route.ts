import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { AuthService } from '@/lib/auth-service';

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
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // For testing purposes, return mock usage history
    const mockHistory = [
      {
        _id: new ObjectId().toString(),
        toolName: 'AI SQL Query Generator',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        success: true
      },
      {
        _id: new ObjectId().toString(),
        toolName: 'AI Bug Finder',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        success: true
      },
      {
        _id: new ObjectId().toString(),
        toolName: 'Learning Assistant',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        success: true
      }
    ];
    
    return NextResponse.json({
      success: true,
      history: mockHistory
    });
  } catch (error) {
    console.error('Usage history error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}