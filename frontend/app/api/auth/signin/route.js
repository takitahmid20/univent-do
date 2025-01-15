import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/config';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Debug log
    console.log('Signin request data:', { username });

    // Determine if this is an admin login attempt
    const isAdminLogin = username === 'admin';
    const loginEndpoint = isAdminLogin 
      ? API_ENDPOINTS.ADMIN_LOGIN
      : API_ENDPOINTS.LOGIN;

    const response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();
    
    // Debug log
    console.log('Response from backend:', data);

    if (!response.ok) {
      throw new Error(data.error || data.detail || 'Invalid credentials');
    }

    // Get user type from response (handle both formats)
    const userType = data.user.userType || data.user.user_type;

    // Transform the response to match our frontend needs
    const userResponse = {
      token: data.token,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        userType: userType,
        dashboardUrl: getDashboardUrl(userType)
      }
    };

    // Debug log
    console.log('Transformed user response:', userResponse);

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Signin error:', error);
    
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Unable to connect to the server. Please make sure the backend server is running.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Invalid credentials' },
      { status: 401 }
    );
  }
}

function getDashboardUrl(userType) {
  switch (userType) {
    case 'organizer':
      return '/dashboard/organizer/settings';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/dashboard/attendee';
  }
}
