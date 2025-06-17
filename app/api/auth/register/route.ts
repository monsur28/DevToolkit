import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AuthService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Get device info using headers() from next/headers
    const headersList = headers();
    const deviceInfo = {
      userAgent: headersList.get('user-agent') || '',
      ipAddress: headersList.get('x-forwarded-for') || 
                 headersList.get('x-real-ip') || 
                 'unknown',
    };

    const result = await AuthService.register(email, password, name, deviceInfo);
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}