import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AuthService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get device info using headers() function from next/headers
    const headersList = headers();
    const deviceInfo = {
      userAgent: headersList.get('user-agent') || '',
      ipAddress: headersList.get('x-forwarded-for') || 
                 headersList.get('x-real-ip') || 
                 'unknown',
    };

    const result = await AuthService.login(email, password, deviceInfo);
    
    if (result.success) {
      // Set token in cookies for server-side auth
      const response = NextResponse.json(result, { status: 200 });
      response.cookies.set({
        name: 'token',
        value: result.token!,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      
      return response;
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}