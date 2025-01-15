from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
import jwt
from datetime import datetime, timedelta
from accounts.middleware import token_required

# Create your views here.

class AdminLoginView(APIView):
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

            # Check against fixed admin credentials
            if username != "admin" or password != "1234":
                return Response({
                    "error": "Invalid admin credentials"
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Generate JWT token for admin
            token_payload = {
                'username': username,
                'user_type': 'admin',
                'exp': datetime.utcnow() + timedelta(days=1),
                'iat': datetime.utcnow(),
            }
            
            token = jwt.encode(
                token_payload,
                settings.SECRET_KEY,
                algorithm='HS256'
            )

            return Response({
                "message": "Admin login successful",
                "token": token,
                "user": {
                    "username": username,
                    "userType": "admin"
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListAttendeesView(APIView):
    @token_required
    def get(self, request):
        try:
            # Verify that the user is an admin
            if request.user_type != 'admin':
                return Response({
                    "error": "Only admin users can access this endpoint"
                }, status=status.HTTP_403_FORBIDDEN)

            with connection.cursor() as cursor:
                # First get total count of attendees
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM users 
                    WHERE user_type = 'attendee'
                """)
                total_count = cursor.fetchone()[0]

                # SQL query to get attendee information
                cursor.execute("""
                    SELECT 
                        u.id,
                        u.email,
                        u.username,
                        COALESCE(ap.full_name, '') as full_name,
                        COALESCE(ap.phone, '') as phone,
                        COALESCE(ap.university, '') as university,
                        COALESCE(ap.department, '') as department,
                        COALESCE(ap.location, '') as location,
                        ap.joined_date,
                        COALESCE(reg_count.total_registrations, 0) as total_registrations
                    FROM users u
                    LEFT JOIN attendee_profiles ap ON u.id = ap.user_id
                    LEFT JOIN (
                        SELECT attendee_id, COUNT(*) as total_registrations 
                        FROM event_registrations 
                        GROUP BY attendee_id
                    ) reg_count ON u.id = reg_count.attendee_id
                    WHERE u.user_type = 'attendee'
                    ORDER BY ap.joined_date DESC NULLS LAST, u.username ASC
                """)
                
                attendees = []
                for row in cursor.fetchall():
                    attendees.append({
                        "id": str(row[0]),
                        "email": row[1],
                        "username": row[2],
                        "fullName": row[3],
                        "phone": row[4],
                        "university": row[5],
                        "department": row[6],
                        "location": row[7],
                        "joinedAt": row[8].strftime("%Y-%m-%d %H:%M:%S") if row[8] else None,
                        "totalEventsRegistered": row[9]
                    })

            return Response({
                "total": total_count,
                "attendees": attendees
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListOrganizersView(APIView):
    @token_required
    def get(self, request):
        try:
            # Verify that the user is an admin
            if request.user_type != 'admin':
                return Response({
                    "error": "Only admin users can access this endpoint"
                }, status=status.HTTP_403_FORBIDDEN)

            with connection.cursor() as cursor:
                # Get total count
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM users 
                    WHERE user_type = 'organizer'
                """)
                total_count = cursor.fetchone()[0]

                # Simple query to get organizer information
                cursor.execute("""
                    SELECT 
                        u.id,
                        u.email,
                        u.username,
                        op.organization_name,
                        op.organization_category,
                        op.website_url,
                        op.phone,
                        op.description,
                        op.joined_date
                    FROM users u
                    LEFT JOIN organizer_profiles op ON u.id = op.user_id
                    WHERE u.user_type = 'organizer'
                    ORDER BY u.username ASC
                """)
                
                organizers = []
                for row in cursor.fetchall():
                    organizers.append({
                        "id": str(row[0]),
                        "email": row[1],
                        "username": row[2],
                        "organizationName": row[3] if row[3] else "",
                        "organizationCategory": row[4] if row[4] else "",
                        "websiteUrl": row[5] if row[5] else "",
                        "phone": row[6] if row[6] else "",
                        "description": row[7] if row[7] else "",
                        "joinedAt": row[8].strftime("%Y-%m-%d %H:%M:%S") if row[8] else None
                    })

            return Response({
                "total": total_count,
                "organizers": organizers
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in ListOrganizersView: {str(e)}")
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteAttendeeView(APIView):
    @token_required
    def delete(self, request, user_id):
        try:
            # Verify that the user is an admin
            if request.user_type != 'admin':
                return Response({
                    "error": "Only admin users can access this endpoint"
                }, status=status.HTTP_403_FORBIDDEN)

            with connection.cursor() as cursor:
                # First check if the user exists and is an attendee
                cursor.execute("""
                    SELECT id FROM users 
                    WHERE id = %s AND user_type = 'attendee'
                """, [user_id])
                
                if not cursor.fetchone():
                    return Response({
                        "error": "Attendee not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                # Begin transaction
                cursor.execute("BEGIN")
                try:
                    # Delete attendee's event registrations
                    cursor.execute("""
                        DELETE FROM event_registrations 
                        WHERE attendee_id = %s
                    """, [user_id])

                    # Delete attendee's profile
                    cursor.execute("""
                        DELETE FROM attendee_profiles 
                        WHERE user_id = %s
                    """, [user_id])

                    # Finally delete the user
                    cursor.execute("""
                        DELETE FROM users 
                        WHERE id = %s
                    """, [user_id])

                    # Commit transaction
                    cursor.execute("COMMIT")

                    return Response({
                        "message": "Attendee deleted successfully"
                    }, status=status.HTTP_200_OK)

                except Exception as e:
                    # Rollback in case of error
                    cursor.execute("ROLLBACK")
                    raise e

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteOrganizerView(APIView):
    @token_required
    def delete(self, request, user_id):
        try:
            # Verify that the user is an admin
            if request.user_type != 'admin':
                return Response({
                    "error": "Only admin users can access this endpoint"
                }, status=status.HTTP_403_FORBIDDEN)

            with connection.cursor() as cursor:
                # First check if the user exists and is an organizer
                cursor.execute("""
                    SELECT id FROM users 
                    WHERE id = %s AND user_type = 'organizer'
                """, [user_id])
                
                if not cursor.fetchone():
                    return Response({
                        "error": "Organizer not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                # Begin transaction
                cursor.execute("BEGIN")
                try:
                    # Delete all event registrations for events created by this organizer
                    cursor.execute("""
                        DELETE FROM event_registrations 
                        WHERE event_id IN (
                            SELECT id FROM events 
                            WHERE organizer_id = %s
                        )
                    """, [user_id])

                    # Delete all events created by this organizer
                    cursor.execute("""
                        DELETE FROM events 
                        WHERE organizer_id = %s
                    """, [user_id])

                    # Delete organizer's profile
                    cursor.execute("""
                        DELETE FROM organizer_profiles 
                        WHERE user_id = %s
                    """, [user_id])

                    # Finally delete the user
                    cursor.execute("""
                        DELETE FROM users 
                        WHERE id = %s
                    """, [user_id])

                    # Commit transaction
                    cursor.execute("COMMIT")

                    return Response({
                        "message": "Organizer and all related data deleted successfully"
                    }, status=status.HTTP_200_OK)

                except Exception as e:
                    # Rollback in case of error
                    cursor.execute("ROLLBACK")
                    raise e

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
