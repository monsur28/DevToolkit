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

    // For testing purposes, return mock suggestions
    const mockSuggestions = [
      {
        _id: new ObjectId().toString(),
        userId: decoded.userId,
        type: 'feature',
        category: 'tool',
        title: 'Add dark mode to SQL generator',
        description: 'It would be great to have a dark mode option for the SQL generator tool to reduce eye strain when working at night.',
        priority: 'medium',
        status: 'pending',
        votes: {
          upvotes: 5,
          downvotes: 0,
          voters: []
        },
        metadata: {
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
        }
      },
      {
        _id: new ObjectId().toString(),
        userId: decoded.userId,
        type: 'improvement',
        category: 'performance',
        title: 'Faster response time for AI tools',
        description: 'The AI tools sometimes take too long to respond. It would be great if the response time could be improved.',
        priority: 'high',
        status: 'reviewing',
        votes: {
          upvotes: 12,
          downvotes: 1,
          voters: []
        },
        metadata: {
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days ago
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      suggestions: mockSuggestions
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

    const { type, category, title, description, attachments } = await request.json();

    if (!type || !category || !title || !description) {
      return NextResponse.json(
        { success: false, message: 'Type, category, title, and description are required' },
        { status: 400 }
      );
    }

    // For testing purposes, return a mock success response
    const mockSuggestion = {
      _id: new ObjectId().toString(),
      userId: decoded.userId,
      type,
      category,
      title,
      description,
      priority: 'medium',
      status: 'pending',
      votes: {
        upvotes: 0,
        downvotes: 0,
        voters: []
      },
      metadata: {
        createdAt: new Date().toISOString()
      }
    };
    
    return NextResponse.json({
      success: true,
      message: 'Suggestion submitted successfully',
      suggestion: mockSuggestion
    });
  } catch (error) {
    console.error('Submit suggestion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}