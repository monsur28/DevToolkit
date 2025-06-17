import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AuthService } from '@/lib/auth-service';

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

    const result = await AuthService.canUserUseAI(decoded.userId);
    
    return NextResponse.json({
      success: true,
      canUse: result.canUse,
      reason: result.reason
    });
  } catch (error) {
    console.error('Check limits error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}