# backend/accounts/views.py
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
import jwt
from datetime import datetime, timedelta, timezone
import uuid
import os

import random
from supabase import create_client
from .middleware import token_required

# Initialize Supabase client
try:
    supabase = create_client(
        'https://ecfrowbxdndascmozjka.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZnJvd2J4ZG5kYXNjbW96amthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMzc1MTksImV4cCI6MjA0ODkxMzUxOX0.e9nF6LGwCpQzrFm07verSn_62pUng3rv6oUUmhlLX20',
        options={
            'auth': {
                'autoRefreshToken': True,
                'persistSession': True
            }
        }
    )
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    supabase = None

class SignUpView(APIView):
    def post(self, request):
        try:
            data = request.data
            user_type = data.get('userType', '').lower()
            
            if user_type not in ['attendee', 'organizer']:
                return Response({
                    "error": "Invalid user type. Must be either 'attendee' or 'organizer'"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate required fields
            required_fields = ['email', 'username', 'password']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return Response({
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }, status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                # Check if email or username already exists
                cursor.execute(
                    "SELECT email, username FROM users WHERE email = %s OR username = %s",
                    [data['email'], data['username']]
                )
                existing = cursor.fetchone()
                if existing:
                    field = 'email' if existing[0] == data['email'] else 'username'
                    return Response({
                        "error": f"This {field} is already registered"
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Create user in Supabase first
                if supabase:
                    try:
                        print("Creating user in Supabase...")
                        # Create user in Supabase Auth
                        supabase_response = supabase.auth.sign_up({
                            "email": data['email'],
                            "password": data['password'],
                            "options": {
                                "data": {
                                    "username": data['username'],
                                    "user_type": user_type
                                }
                            }
                        })
                        print("Supabase response:", supabase_response)
                        
                        if not supabase_response.user:
                            raise Exception("Failed to create Supabase user")

                    except Exception as e:
                        print(f"Supabase error: {str(e)}")
                        return Response({
                            "error": f"Failed to create user account: {str(e)}"
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


                # Insert into custom users table
                user_id = uuid.uuid4()
                cursor.execute("""
                    INSERT INTO users (id, email, username, password, user_type, email_verified)
                    VALUES (%s, %s, %s, %s, %s, FALSE)
                    RETURNING id
                """, [
                    user_id,
                    data['email'],
                    data['username'],
                    make_password(data['password']),
                    user_type
                ])

                # Create empty profile based on user type
                if user_type == 'attendee':
                    cursor.execute("""
                        INSERT INTO attendee_profiles (user_id)
                        VALUES (%s)
                    """, [user_id])
                else:  # organizer
                    cursor.execute("""
                        INSERT INTO organizer_profiles (user_id)
                        VALUES (%s)
                    """, [user_id])

                return Response({
                    "message": "Registration successful. Please check your email for verification.",
                    "userId": user_id,
                    "email": data['email'],
                    "username": data['username'],
                    "userType": user_type
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class LoginView(APIView):
    def post(self, request):
        try:
            # Get login credentials
            data = request.data
            username = data.get('username')
            password = data.get('password')

            # Validate required fields
            if not all([username, password]):
                return Response({
                    "error": "Username and password are required"
                }, status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                # Find user by username
                cursor.execute("""
                    SELECT id, email, password, username, user_type 
                    FROM users 
                    WHERE username = %s
                """, [username])
                
                user = cursor.fetchone()
                
                if not user:
                    return Response({
                        "error": "Invalid username or password"
                    }, status=status.HTTP_401_UNAUTHORIZED)

                # Check password
                stored_password = user[2]  # Index 2 contains the password
                if not check_password(password, stored_password):
                    return Response({
                        "error": "Invalid username or password"
                    }, status=status.HTTP_401_UNAUTHORIZED)

                # Generate JWT token with all required claims
                token_payload = {
                    'user_id': str(user[0]),  # Convert UUID to string
                    'email': user[1],
                    'username': user[3],
                    'user_type': user[4],
                    'exp': datetime.utcnow() + timedelta(days=1),  # Expiration
                    'iat': datetime.utcnow(),  # Issued at
                }
                
                token = jwt.encode(
                    token_payload,
                    settings.SECRET_KEY,
                    algorithm='HS256'
                )

                return Response({
                    "message": "Login successful",
                    "token": token,
                    "user": {
                        "id": str(user[0]),
                        "email": user[1],
                        "username": user[3],
                        "userType": user[4]
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class LogoutView(APIView):
#     @token_required
#     def post(self, request):
#         try:
#             token = request.headers.get('Authorization').split(' ')[1]
            
#             # Get token payload to get expiration
#             payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
#             exp_timestamp = payload.get('exp')
            
#             if not exp_timestamp:
#                 return Response({
#                     'error': 'Token is missing expiration'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             exp_datetime = datetime.fromtimestamp(exp_timestamp, timezone.utc)
            
#             # Add token to invalid_tokens table
#             with connection.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO invalid_tokens (token, expires_at)
#                     VALUES (%s, %s)
#                     ON CONFLICT (token) DO NOTHING
#                 """, [token, exp_datetime])
            
#             return Response({
#                 'message': 'Successfully logged out'
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             return Response({
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AttendeeProfileView(APIView):
    @token_required
    def get(self, request):
        try:
            user_id = request.user['user_id']
            user_type = request.user['user_type']

            if user_type != 'attendee':
                return Response({
                    "error": "Access denied. This endpoint is for attendees only."
                }, status=status.HTTP_403_FORBIDDEN)
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT u.id, u.email, u.username, u.user_type,
                           p.full_name, p.phone, p.university, p.department,
                           p.location, p.profile_picture_url, p.joined_date
                    FROM users u
                    JOIN attendee_profiles p ON u.id = p.user_id
                    WHERE u.id = %s
                """, [user_id])
                
                user = cursor.fetchone()
                
                if not user:
                    return Response({
                        "error": "Profile not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                return Response({
                    "user": {
                        "id": str(user[0]),
                        "email": user[1],
                        "username": user[2],
                        "userType": user[3],
                        "fullName": user[4] or "",
                        "phone": user[5] or "",
                        "university": user[6] or "",
                        "department": user[7] or "",
                        "location": user[8] or "",
                        "profilePicture": user[9] or "",
                        "joinedDate": user[10].strftime("%B %Y") if user[10] else ""
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @token_required
    def put(self, request):
        try:
            user_id = request.user['user_id']
            user_type = request.user['user_type']
            data = request.data

            if user_type != 'attendee':
                return Response({
                    "error": "Access denied. This endpoint is for attendees only."
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Handle profile picture
            profile_picture_url = None
            if 'profilePicture' in request.FILES:
                file = request.FILES['profilePicture']
                # Generate a unique filename
                ext = file.name.split('.')[-1]
                filename = f"profile_pictures/{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
                
                # Save file to media directory
                file_path = os.path.join(settings.MEDIA_ROOT, filename)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                with open(file_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                
                # Generate URL
                profile_picture_url = f"{settings.SITE_URL}{settings.MEDIA_URL}{filename}"
            
            with connection.cursor() as cursor:
                # Only update profile picture if a new one was uploaded
                profile_picture_param = profile_picture_url if profile_picture_url else data.get('profilePicture')
                
                cursor.execute("""
                    UPDATE attendee_profiles SET
                        full_name = COALESCE(%s, full_name),
                        phone = COALESCE(%s, phone),
                        university = COALESCE(%s, university),
                        department = COALESCE(%s, department),
                        location = COALESCE(%s, location),
                        profile_picture_url = COALESCE(%s, profile_picture_url)
                    WHERE user_id = %s
                    RETURNING *
                """, [
                    data.get('fullName'),
                    data.get('phone'),
                    data.get('university'),
                    data.get('department'),
                    data.get('location'),
                    profile_picture_param,
                    user_id
                ])

                updated_profile = cursor.fetchone()
                if not updated_profile:
                    return Response({
                        "error": "Profile not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                # Get user data
                cursor.execute("""
                    SELECT id, email, username, user_type
                    FROM users
                    WHERE id = %s
                """, [user_id])
                user = cursor.fetchone()

                return Response({
                    "message": "Profile updated successfully",
                    "user": {
                        "id": str(user[0]),
                        "email": user[1],
                        "username": user[2],
                        "userType": user[3],
                        "fullName": updated_profile[1] or "",
                        "phone": updated_profile[2] or "",
                        "university": updated_profile[3] or "",
                        "department": updated_profile[4] or "",
                        "location": updated_profile[5] or "",
                        "profilePicture": updated_profile[6] or "",
                        "joinedDate": updated_profile[7].strftime("%B %Y") if updated_profile[7] else ""
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganizerProfileView(APIView):
    @token_required
    def get(self, request):
        try:
            user_id = request.user['user_id']
            user_type = request.user['user_type']

            if user_type != 'organizer':
                return Response({
                    "error": "Access denied. This endpoint is for organizers only."
                }, status=status.HTTP_403_FORBIDDEN)
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT u.id, u.email, u.username, u.user_type,
                           p.organization_name, p.phone, p.website_url,
                           p.facebook_url, p.organization_category,
                           p.description, p.profile_picture_url, p.joined_date,
                           p.slug
                    FROM users u
                    JOIN organizer_profiles p ON u.id = p.user_id
                    WHERE u.id = %s
                """, [user_id])
                
                user = cursor.fetchone()
                
                if not user:
                    return Response({
                        "error": "Profile not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                # Convert None values to empty strings for frontend
                profile_data = {
                    "id": str(user[0]),
                    "email": user[1],
                    "username": user[2],
                    "userType": user[3],
                    "organizationName": user[4] if user[4] else "",
                    "phone": user[5] if user[5] else "",
                    "websiteUrl": user[6] if user[6] else "",
                    "facebookUrl": user[7] if user[7] else "",
                    "organizationCategory": user[8] if user[8] else "",
                    "description": user[9] if user[9] else "",
                    "profilePicture": user[10] if user[10] else "",
                    "joinedDate": user[11].strftime("%B %Y") if user[11] else "",
                    "slug": user[12] if user[12] else ""
                }

                return Response({
                    "user": profile_data
                }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error fetching profile: {str(e)}")
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @token_required
    def put(self, request):
        try:
            user_id = request.user['user_id']
            user_type = request.user['user_type']
            data = request.data

            if user_type != 'organizer':
                return Response({
                    "error": "Access denied. This endpoint is for organizers only."
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Handle profile picture upload
            profile_picture_url = None
            if 'profilePicture' in request.FILES:
                file = request.FILES['profilePicture']
                
                # Validate file size (1MB)
                if file.size > 1024 * 1024:
                    return Response({
                        "error": "File size must be less than 1MB"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Validate file type
                if file.content_type not in ['image/jpeg', 'image/png']:
                    return Response({
                        "error": "Only JPG and PNG files are allowed"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Generate a unique filename
                ext = file.name.split('.')[-1]
                filename = f"organizer_profiles/{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
                
                # Save file to media directory
                file_path = os.path.join(settings.MEDIA_ROOT, filename)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                with open(file_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                
                # Generate URL
                profile_picture_url = f"{settings.SITE_URL}{settings.MEDIA_URL}{filename}"
            
            with connection.cursor() as cursor:
                # Get current profile data
                cursor.execute("""
                    SELECT organization_name, phone, website_url, facebook_url, 
                           organization_category, description, profile_picture_url,
                           slug
                    FROM organizer_profiles 
                    WHERE user_id = %s
                """, [user_id])
                current_profile = cursor.fetchone()
                
                if not current_profile:
                    return Response({
                        "error": "Profile not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                # Check if new slug is available if provided
                new_slug = data.get('slug')
                if new_slug:
                    # Clean and format the slug
                    new_slug = new_slug.lower().strip()
                    new_slug = ''.join(c if c.isalnum() or c == '-' else '-' for c in new_slug)
                    new_slug = '-'.join(filter(None, new_slug.split('-')))
                    
                    # Check if slug is taken by another user
                    cursor.execute("""
                        SELECT EXISTS(
                            SELECT 1 
                            FROM organizer_profiles 
                            WHERE slug = %s 
                            AND user_id != %s
                        )
                    """, [new_slug, user_id])
                    exists = cursor.fetchone()[0]
                    
                    if exists:
                        return Response({
                            "error": "This slug is already taken"
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                # Update profile with new data, keeping existing values if not provided
                update_values = [
                    data.get('organizationName', current_profile[0]) or current_profile[0],
                    data.get('phone', current_profile[1]) or current_profile[1],
                    data.get('websiteUrl', current_profile[2]) or current_profile[2],
                    data.get('facebookUrl', current_profile[3]) or current_profile[3],
                    data.get('organizationCategory', current_profile[4]) or current_profile[4],
                    data.get('description', current_profile[5]) or current_profile[5],
                    profile_picture_url or current_profile[6],  # Use new picture URL if uploaded, else keep current
                    new_slug or current_profile[7],  # Use new slug if provided, else keep current
                    user_id
                ]
                
                cursor.execute("""
                    UPDATE organizer_profiles SET
                        organization_name = %s,
                        phone = %s,
                        website_url = %s,
                        facebook_url = %s,
                        organization_category = %s,
                        description = %s,
                        profile_picture_url = %s,
                        slug = %s
                    WHERE user_id = %s
                    RETURNING user_id, organization_name, phone, website_url, 
                             facebook_url, organization_category, description, 
                             profile_picture_url, joined_date, slug;
                """, update_values)

                updated_profile = cursor.fetchone()

                # Get user data
                cursor.execute("""
                    SELECT id, email, username, user_type
                    FROM users
                    WHERE id = %s
                """, [user_id])
                user = cursor.fetchone()

                # Convert None values to empty strings for frontend
                profile_data = {
                    "id": str(user[0]),
                    "email": user[1],
                    "username": user[2],
                    "userType": user[3],
                    "organizationName": updated_profile[1] if updated_profile[1] else "",
                    "phone": updated_profile[2] if updated_profile[2] else "",
                    "websiteUrl": updated_profile[3] if updated_profile[3] else "",
                    "facebookUrl": updated_profile[4] if updated_profile[4] else "",
                    "organizationCategory": updated_profile[5] if updated_profile[5] else "",
                    "description": updated_profile[6] if updated_profile[6] else "",
                    "profilePicture": updated_profile[7] if updated_profile[7] else "",
                    "joinedDate": updated_profile[8].strftime("%B %Y") if updated_profile[8] else "",
                    "slug": updated_profile[9] if updated_profile[9] else ""
                }

                return Response({
                    "message": "Profile updated successfully",
                    "user": profile_data
                }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganizerSlugView(APIView):
    @token_required
    def get(self, request):
        """Get organizer's current slug"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT slug
                    FROM organizer_profiles
                    WHERE user_id = %s;
                """, [request.user['user_id']])
                
                result = cursor.fetchone()
                if result:
                    return Response({
                        'status': 'success',
                        'data': {
                            'slug': result[0]
                        }
                    })
                return Response({
                    'status': 'error',
                    'message': 'Organizer profile not found'
                }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @token_required
    def put(self, request):
        """Update organizer's slug"""
        try:
            new_slug = request.data.get('slug')
            if not new_slug:
                return Response({
                    'status': 'error',
                    'message': 'Slug is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Clean and format the slug
            new_slug = new_slug.lower().strip()
            new_slug = ''.join(c if c.isalnum() or c == '-' else '-' for c in new_slug)
            new_slug = '-'.join(filter(None, new_slug.split('-')))

            # Check if slug is available
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 
                        FROM organizer_profiles 
                        WHERE slug = %s 
                        AND user_id != %s
                    )
                """, [new_slug, request.user['user_id']])
                exists = cursor.fetchone()[0]

                if exists:
                    return Response({
                        'status': 'error',
                        'message': 'This slug is already taken'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Update the slug
                cursor.execute("""
                    UPDATE organizer_profiles
                    SET slug = %s
                    WHERE user_id = %s
                    RETURNING slug;
                """, [new_slug, request.user['user_id']])
                
                result = cursor.fetchone()
                return Response({
                    'status': 'success',
                    'data': {
                        'slug': result[0]
                    }
                })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheckSlugAvailabilityView(APIView):
    def get(self, request):
        """Check if a slug is available"""
        try:
            slug = request.GET.get('slug')
            if not slug:
                return Response({
                    'status': 'error',
                    'message': 'Slug parameter is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Clean and format the slug
            slug = slug.lower().strip()
            slug = ''.join(c if c.isalnum() or c == '-' else '-' for c in slug)
            slug = '-'.join(filter(None, slug.split('-')))

            # Check if slug exists
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 
                        FROM organizer_profiles 
                        WHERE slug = %s
                    )
                """, [slug])
                exists = cursor.fetchone()[0]

                return Response({
                    'status': 'success',
                    'data': {
                        'is_available': not exists,
                        'formatted_slug': slug
                    }
                })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateEmailView(APIView):
    @token_required
    def put(self, request):
        try:
            user_id = request.user['user_id']
            user_type = request.user['user_type']
            data = request.data

            if user_type != 'attendee':
                return Response({
                    "error": "Access denied. This endpoint is for attendees only."
                }, status=status.HTTP_403_FORBIDDEN)

            if 'email' not in data:
                return Response({
                    "error": "Email is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                # Check if email already exists
                cursor.execute(
                    "SELECT id FROM users WHERE email = %s AND id != %s",
                    [data['email'], user_id]
                )
                if cursor.fetchone():
                    return Response({
                        "error": "This email is already registered"
                    }, status=status.HTTP_409_CONFLICT)

                # Update email
                cursor.execute("""
                    UPDATE users SET email = %s
                    WHERE id = %s
                    RETURNING id, email, username, user_type
                """, [data['email'], user_id])

                user = cursor.fetchone()
                if not user:
                    return Response({
                        "error": "User not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                return Response({
                    "message": "Email updated successfully",
                    "user": {
                        "id": str(user[0]),
                        "email": user[1],
                        "username": user[2],
                        "userType": user[3]
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyEmailView(APIView):
    def post(self, request):
        try:
            data = request.data
            email = data.get('email')
            token = data.get('token')  # This is the OTP

            if not email or not token:
                return Response({
                    "error": "Email and verification code are required"
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Verify with OTP token
                if supabase:
                    result = supabase.auth.verify_otp({
                        "email": email,
                        "token": token,
                        "type": "email"
                    })

                    # Update user's verified status in your database
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            UPDATE users 
                            SET email_verified = TRUE 
                            WHERE email = %s
                        """, [email])

                    return Response({
                        "message": "Email verified successfully"
                    })
                else:
                    return Response({
                        "error": "Email service is not available"
                    }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            except Exception as e:
                return Response({
                    "error": "Invalid or expired verification code"
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendVerificationView(APIView):
    def post(self, request):
        try:
            data = request.data
            email = data.get('email')

            if not email:
                return Response({
                    "error": "Email is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                # Get user
                cursor.execute("""
                    SELECT id, username, email_verified 
                    FROM users 
                    WHERE email = %s
                """, [email])

                user = cursor.fetchone()

                if not user:
                    return Response({
                        "error": "User not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                user_id, username, email_verified = user

                if email_verified:
                    return Response({
                        "error": "Email is already verified"
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Send new verification email
                if supabase:
                    try:
                        result = supabase.auth.admin.generate_email_otp(
                            email=email,
                            options={
                                "data": {
                                    "username": username,
                                    "user_id": str(user_id)
                                }
                            }
                        )
                        return Response({
                            "message": "New verification code sent successfully"
                        })
                    except Exception as e:
                        return Response({
                            "error": "Failed to send verification email"
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    return Response({
                        "error": "Email service is not available"
                    }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicOrganizersListView(APIView):
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    WITH EventCounts AS (
                        SELECT 
                            e.organizer_id,
                            COUNT(DISTINCT e.id) as event_count
                        FROM events e
                        GROUP BY e.organizer_id
                    ),
                    UpcomingEvents AS (
                        SELECT DISTINCT ON (e.organizer_id, e.title)
                            e.organizer_id,
                            e.title,
                            e.event_date,
                            e.venue,
                            e.address,
                            e.slug as event_slug,
                            ROW_NUMBER() OVER (
                                PARTITION BY e.organizer_id 
                                ORDER BY e.event_date ASC
                            ) as rn
                        FROM events e
                        WHERE e.event_date >= CURRENT_DATE
                            AND e.status = 'upcoming'
                            AND e.publication_status = 'published'
                        ORDER BY e.organizer_id, e.title, e.event_date ASC
                    )
                    SELECT 
                        u.id,
                        op.organization_name,
                        op.profile_picture_url as logo,
                        op.organization_category as category,
                        op.slug,
                        COALESCE(ec.event_count, 0) as total_events,
                        
                        json_agg(
                            CASE 
                                WHEN ue.rn <= 3 THEN json_build_object(
                                    'title', ue.title,
                                    'date', ue.event_date,
                                    'venue', ue.venue,
                                    'address', ue.address,
                                    'slug', ue.event_slug,
                                )
                                ELSE NULL 
                           
                            END
                        ) FILTER (WHERE ue.rn <= 3) as upcoming_events
                    FROM 
                        users u
                    JOIN 
                        organizer_profiles op ON u.id = op.user_id
                    LEFT JOIN 
                        EventCounts ec ON u.id = ec.organizer_id
                    LEFT JOIN 
                        UpcomingEvents ue ON u.id = ue.organizer_id
                    GROUP BY 
                        u.id, 
                        op.organization_name, 
                        op.profile_picture_url, 
                        op.organization_category,
                        op.slug,
                        ec.event_count
                    ORDER BY 
                        COALESCE(ec.event_count, 0) DESC, 
                        op.organization_name ASC;
                """)

                columns = [col[0] for col in cursor.description]
                organizers = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]

                # Convert the response to match the expected format
                formatted_organizers = []
                for org in organizers:
                    # Split the upcoming events string into a list
                    upcoming_events = []
                    if org['upcoming_events']:
                        upcoming_events = [
                            
                            event for event in org['upcoming_events']
                            if event is not None
                        ][:3]  # Take only first 3 unique upcoming events

                    formatted_org = {
                        'id': org['id'],
                        'organization_name': org['organization_name'],
                        'logo': org['logo'] or '',
                        'category': org['category'] or '',
                        'slug': org['slug'] or '',
                        'total_events': org['total_events'],
                        'upcoming_events': upcoming_events
                    }
                    formatted_organizers.append(formatted_org)

                return Response({
                    'status': 'success',
                    'message': 'Organizers retrieved successfully',
                    'data': formatted_organizers
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganizerDetailView(APIView):
    def get(self, request, slug):
        """Get organizer details by slug"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    WITH EventCounts AS (
                        SELECT 
                            e.organizer_id,
                            COUNT(DISTINCT e.id) as event_count
                        FROM events e
                        GROUP BY e.organizer_id
                    ),
                    UpcomingEvents AS (
                        SELECT DISTINCT ON (e.organizer_id, e.title)
                            e.organizer_id,
                            e.title,
                            e.event_date,
                            e.venue,
                            e.address,
                            ROW_NUMBER() OVER (
                                PARTITION BY e.organizer_id 
                                ORDER BY e.event_date ASC
                            ) as rn
                        FROM events e
                        WHERE e.event_date >= CURRENT_DATE
                            AND e.status = 'upcoming'
                            AND e.publication_status = 'published'
                        ORDER BY e.organizer_id, e.title, e.event_date ASC
                    )
                    SELECT 
                        u.id,
                        u.email,
                        op.organization_name,
                        op.phone,
                        op.website_url,
                        op.facebook_url,
                        op.organization_category,
                        op.description,
                        op.profile_picture_url as logo,
                        op.slug,
                        COALESCE(ec.event_count, 0) as total_events,
                        json_agg(
                            CASE 
                                WHEN ue.rn <= 3 THEN json_build_object(
                                    'title', ue.title,
                                    'date', ue.event_date,
                                    'venue', ue.venue,
                                    'address', ue.address
                                )
                                ELSE NULL 
                            END
                        ) FILTER (WHERE ue.rn <= 3) as upcoming_events
                    FROM 
                        users u
                    JOIN 
                        organizer_profiles op ON u.id = op.user_id
                    LEFT JOIN 
                        EventCounts ec ON u.id = ec.organizer_id
                    LEFT JOIN 
                        UpcomingEvents ue ON u.id = ue.organizer_id
                    WHERE 
                        op.slug = %s
                    GROUP BY 
                        u.id,
                        u.email,
                        op.organization_name,
                        op.phone,
                        op.website_url,
                        op.facebook_url,
                        op.organization_category,
                        op.description,
                        op.profile_picture_url,
                        op.slug,
                        ec.event_count;
                """, [slug])
                
                result = cursor.fetchone()
                if not result:
                    return Response({
                        'status': 'error',
                        'message': 'Organizer not found'
                    }, status=status.HTTP_404_NOT_FOUND)

                columns = [col[0] for col in cursor.description]
                organizer = dict(zip(columns, result))

                # Clean up the upcoming_events JSON
                if organizer['upcoming_events']:
                    organizer['upcoming_events'] = [
                        event for event in organizer['upcoming_events']
                        if event is not None
                    ]
                else:
                    organizer['upcoming_events'] = []

                # Remove email if not authenticated
                if not request.user or not request.user.is_authenticated:
                    organizer.pop('email', None)

                return Response({
                    'status': 'success',
                    'data': organizer
                })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
