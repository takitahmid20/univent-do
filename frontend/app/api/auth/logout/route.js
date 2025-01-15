import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In the future, you might want to call the backend to invalidate the token
    // For now, we'll just return a success response
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
