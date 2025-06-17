import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

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

    const suggestions = AuthService.getSuggestions();
    
    // Add user email to suggestions
    const suggestionsWithUserInfo = suggestions.map(suggestion => {
      const user = AuthService.getUserById(suggestion.userId);
      return {
        ...suggestion,
        userEmail: user?.email || 'Unknown'
      };
    });
    
    return NextResponse.json({
      success: true,
      suggestions: suggestionsWithUserInfo.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    console.error('Get admin suggestions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}