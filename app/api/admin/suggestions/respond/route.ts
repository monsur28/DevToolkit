import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';
import { SuggestionService } from '@/lib/suggestion-service';

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

    const { suggestionId, status, adminResponse } = await request.json();

    if (!suggestionId || !status) {
      return NextResponse.json(
        { success: false, message: 'Suggestion ID and status are required' },
        { status: 400 }
      );
    }

    const success = await SuggestionService.updateSuggestionStatus(
      suggestionId,
      status,
      decoded.userId,
      adminResponse
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Suggestion updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update suggestion' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Respond to suggestion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}