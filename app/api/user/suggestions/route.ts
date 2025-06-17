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
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const suggestions = AuthService.getUserSuggestions(decoded.userId);
    
    return NextResponse.json({
      success: true,
      suggestions: suggestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { type, title, content } = await request.json();

    if (!type || !title || !content) {
      return NextResponse.json(
        { success: false, message: 'Type, title, and content are required' },
        { status: 400 }
      );
    }

    AuthService.addSuggestion(decoded.userId, type, title, content);
    
    return NextResponse.json({
      success: true,
      message: 'Suggestion submitted successfully'
    });
  } catch (error) {
    console.error('Submit suggestion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}