import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AuthService } from '@/lib/auth-service';
import { SuggestionService } from '@/lib/suggestion-service';

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
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') as any;
    const type = url.searchParams.get('type') as any;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const suggestions = await SuggestionService.getAllSuggestions(status, type, limit);
    
    // Add user email to suggestions
    const suggestionsWithUserInfo = await Promise.all(
      suggestions.map(async (suggestion) => {
        const user = await AuthService.getUserById(suggestion.userId);
        return {
          ...suggestion,
          userEmail: user?.email || 'Unknown'
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      suggestions: suggestionsWithUserInfo
    });
  } catch (error) {
    console.error('Get admin suggestions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}