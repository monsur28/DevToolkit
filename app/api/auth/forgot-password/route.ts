import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await AuthService.requestPasswordReset(email);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}