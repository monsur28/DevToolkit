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
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const suggestions = await SuggestionService.getSuggestionsByUser(decoded.userId);
    
    return NextResponse.json({
      success: true,
      suggestions
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

    const { type, category, title, description, attachments } = await request.json();

    if (!type || !category || !title || !description) {
      return NextResponse.json(
        { success: false, message: 'Type, category, title, and description are required' },
        { status: 400 }
      );
    }

    const suggestion = await SuggestionService.createSuggestion(
      decoded.userId,
      type,
      category,
      title,
      description,
      attachments || []
    );
    
    return NextResponse.json({
      success: true,
      message: 'Suggestion submitted successfully',
      suggestion
    });
  } catch (error) {
    console.error('Submit suggestion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}