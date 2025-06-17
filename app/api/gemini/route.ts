import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini-service';
import { AuthService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);
      
      if (decoded) {
        userId = decoded.userId;
        
        // Check if user can use AI
        const canUse = await AuthService.canUserUseAI(userId);
        if (!canUse.canUse) {
          return NextResponse.json(
            { success: false, message: canUse.reason || 'Usage limit exceeded' },
            { status: 403 }
          );
        }
      }
    }

    const { prompt, action, data } = await request.json();

    if (!prompt && !action) {
      return NextResponse.json(
        { success: false, message: 'Prompt or action is required' },
        { status: 400 }
      );
    }

    const gemini = new GeminiService();
    let result;

    try {
      if (action === 'sql') {
        result = await gemini.generateSQL(prompt, data?.tableContext, userId);
      } else if (action === 'findBugs') {
        result = await gemini.findBugs(prompt, userId);
      } else if (action === 'answerQuestion') {
        result = await gemini.answerTechQuestion(prompt, userId);
      } else {
        // Default to general content generation
        result = await gemini.generateContent(prompt, userId);
      }

      return NextResponse.json({
        success: true,
        result
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || 'Failed to generate content',
          error: error.toString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}