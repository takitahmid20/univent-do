import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const data = await request.json();
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Get user type from request body
    const isOrganizer = data.userType === 'organizer';
    delete data.userType; // Remove userType from data before sending to backend
    
    // Use the appropriate endpoint based on user type
    const endpoint = isOrganizer 
      ? 'http://127.0.0.1:5656/api/accounts/organizer/profile/'
      : 'http://127.0.0.1:5656/api/accounts/attendee/profile/';

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update profile');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
