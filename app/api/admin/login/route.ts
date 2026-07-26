import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const envEmail = (process.env.ADMIN_EMAIL || 'admin@ean.aero').trim().toLowerCase();
    const envPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Both email and password are required.' },
        { status: 400 }
      );
    }

    if (inputEmail === envEmail && inputPassword === envPassword) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Executive authentication successful',
          user: {
            email: envEmail,
            role: 'Lead Command Admin'
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid admin credentials. Please verify your email and passcode in .env.local' 
      },
      { status: 401 }
    );
  } catch (err: unknown) {
    console.error('Admin login API error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing login request.' },
      { status: 500 }
    );
  }
}
