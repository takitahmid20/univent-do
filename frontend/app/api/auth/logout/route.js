import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/config';

export async function POST(request) {
  try {
    const { token } = await request.json();

    // Make the request to the backend
    const response = await fetch(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Logged out successfully' });
    } else {
      throw new Error('Failed to logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
