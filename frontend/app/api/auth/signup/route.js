import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/config';

export async function POST(request) {
  try {
    const { userName, email, password, userType } = await request.json();
    
    // Debug log
    console.log('Signup request data:', { userName, email, userType });

    const requestBody = {
      username: userName,
      email: email,
      password: password,
      userType: userType.toLowerCase(),
    };

    // Debug log
    console.log('Request body being sent to backend:', requestBody);

    // Call your Django backend API
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Debug log
    console.log('Response from backend:', data);

    if (!response.ok) {
      // If the response wasn't successful, throw an error with the message from the backend
      throw new Error(data.error || data.detail || 'Failed to create account');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Signup error:', error);
    
    // Check if it's a connection error
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Unable to connect to the server. Please make sure the backend server is running.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 400 }
    );
  }
}