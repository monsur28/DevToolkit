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

    const { suggestionId, adminResponse } = await request.json();

    if (!suggestionId || !adminResponse) {
      return NextResponse.json(
        { success: false, message: 'Suggestion ID and admin response are required' },
        { status: 400 }
      );
    }

    AuthService.respondToSuggestion(suggestionId, adminResponse);
    
    return NextResponse.json({
      success: true,
      message: 'Response sent successfully'
    });
  } catch (error) {
    console.error('Respond to suggestion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}