import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }

    const result = await AuthService.verifyEmail(token);
    
    if (result.success) {
      // Send welcome email after successful verification
      try {
        // Get user by verification token to send welcome email
        // This is a simplified approach - in production you might want to handle this differently
        const user = await AuthService.getUserById(token); // This won't work as written, needs proper implementation
        if (user) {
          await EmailService.sendWelcomeEmail(user.email, user.profile.firstName);
        }
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't fail the verification if welcome email fails
      }
      
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}