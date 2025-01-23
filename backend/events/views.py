from this import d
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
import uuid
import logging
import jwt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, BasePermission
import os
import json

import base64
from io import BytesIO
from PIL import Image

from accounts.middleware import token_required
from .db_manager import create_event, get_event, get_organizer_events, update_event, delete_event, register_for_event, get_registration_details, get_organizer_events_with_registrations, get_event_registrations, update_event_by_slug, get_event_by_slug, get_user_registered_events, process_check_in, get_event_participants, get_organizer_dashboard, get_user_event_statistics

from django.http import HttpResponse
from .ticket_generator import generate_ticket_pdf

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

logger = logging.getLogger(__name__)

# Create your views here.


class IsOrganizer(BasePermission):
    """
    Custom permission to only allow organizers to access the view.
    """
    def has_permission(self, request, view):
        is_authenticated = request.user and request.user.is_authenticated
        is_organizer = hasattr(request.user, 'user_type') and request.user.user_type == 'organizer'
        
        print(f"User: {request.user}")
        print(f"Is authenticated: {is_authenticated}")
        print(f"User type: {getattr(request.user, 'user_type', None)}")
        print(f"Is organizer: {is_organizer}")
        
        return is_authenticated and is_organizer


class CreateEventView(APIView):
    @token_required
    def post(self, request):
        try:
            # Get user info from token
            token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user_type = payload.get('user_type')

            # Print request data for debugging
            print("Request data:", request.data)
            print("User ID:", user_id)
            print("User type:", user_type)

            # Check if user is an organizer
            if user_type != 'organizer':
                return Response({
                    'error': 'Only organizers can create events'
                }, status=status.HTTP_403_FORBIDDEN)

            # Get data from request
            data = request.data
            required_fields = ['title', 'description', 'category', 'venue', 
                             'address', 'event_date', 'event_time']
            
            # Validate required fields
            for field in required_fields:
                if not data.get(field):
                    return Response({
                        'error': f'{field} is required'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate date and time
            try:
                event_date = datetime.strptime(data['event_date'], '%Y-%m-%d').date()
                event_time = datetime.strptime(data['event_time'], '%H:%M').time()
                
                if event_date < datetime.now().date():
                    return Response({
                        'error': 'Event date cannot be in the past'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ValueError as e:
                print(f"Date/time validation error: {str(e)}")
                return Response({
                    'error': f'Invalid date or time format: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Prepare event data
            event_data = {
                'title': data['title'],
                'description': data['description'],
                'organizer_id': user_id,
                'category': data['category'],
                'event_type': data.get('event_type', 'public'),
                'venue': data['venue'],
                'address': data['address'],
                'event_date': event_date,
                'event_time': event_time,
                'ticket_price': float(data.get('ticket_price', 0)),
                'max_attendees': int(data.get('max_attendees', 0)) or None,
                'image_url': data.get('image_url'),
                'publication_status': data.get('publication_status', 'draft')
            }

            print("Prepared event data:", event_data)

            # Create event
            event_id = create_event(event_data)
            if not event_id:
                return Response({
                    'error': 'Failed to create event in database'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Get created event details
            event = get_event(event_id)
            return Response({
                'message': 'Event created successfully',
                'event': event
            }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            print(f"ValueError: {str(e)}")
            return Response({
                'error': f'Invalid data format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({
                'error': f'An error occurred while creating the event: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganizerEventsView(APIView):
    @token_required
    def get(self, request):
        try:
            # Get user info from token
            token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user_type = payload.get('user_type')

            # Check if user is an organizer
            if user_type != 'organizer':
                return Response({
                    'error': 'Only organizers can view their events'
                }, status=status.HTTP_403_FORBIDDEN)

            # Get organizer's events
            events = get_organizer_events(user_id)
            if events is None:
                return Response({
                    'error': 'Failed to retrieve events'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                'events': events
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in OrganizerEventsView: {str(e)}")
            return Response({
                'error': f'An error occurred while retrieving events: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class UpdateEventView(APIView):
#     @token_required
#     def put(self, request, event_id):
#         try:
#             print(f"Updating event with ID: {event_id}")
#             print(f"Request data: {request.data}")
            
#             # Get user info from token
#             token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
#             payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
#             user_id = payload.get('user_id')
#             user_type = payload.get('user_type')
#             print(f"User ID from token: {user_id}")
#             print(f"User type from token: {user_type}")

#             # Check if user is an organizer
#             if user_type != 'organizer':
#                 print("User is not an organizer")
#                 return Response({
#                     'error': 'Only organizers can update events'
#                 }, status=status.HTTP_403_FORBIDDEN)

#             # First check if event exists and user is the organizer
#             with connection.cursor() as cursor:
#                 cursor.execute(
#                     "SELECT organizer_id FROM events WHERE id = %s",
#                     [event_id]
#                 )
#                 result = cursor.fetchone()
#                 if not result:
#                     print("Event not found")
#                     return Response({
#                         'error': 'Event not found'
#                     }, status=status.HTTP_404_NOT_FOUND)
                
#                 if str(result[0]) != str(user_id):
#                     print(f"User {user_id} is not the organizer of event {event_id}")
#                     return Response({
#                         'error': 'You are not authorized to update this event'
#                     }, status=status.HTTP_403_FORBIDDEN)

#             # Get event data
#             event_data = {}
#             for field in ['title', 'description', 'category', 'event_date', 'event_time', 
#                          'venue', 'address', 'ticket_price', 'max_attendees', 'publication_status']:
#                 if field in request.data:
#                     event_data[field] = request.data[field]
            
#             print(f"Processed event data: {event_data}")

#             # Handle image upload if present (check both 'image' and 'image_url' fields)
#             image_file = request.FILES.get('image') or request.FILES.get('image_url')
#             if image_file:
#                 try:
#                     print(f"Processing image: {image_file.name}, size: {image_file.size}")
                    
#                     # Generate unique filename
#                     ext = image_file.name.split('.')[-1].lower()
#                     if ext not in ['jpg', 'jpeg', 'png', 'gif']:
#                         return Response({
#                             'error': 'Invalid image format. Only jpg, jpeg, png, and gif are allowed.'
#                         }, status=status.HTTP_400_BAD_REQUEST)
                    
#                     filename = f"{uuid.uuid4()}.{ext}"
                    
#                     # Save file
#                     filepath = os.path.join(settings.MEDIA_ROOT, 'events', filename)
#                     os.makedirs(os.path.dirname(filepath), exist_ok=True)
                    
#                     with open(filepath, 'wb+') as destination:
#                         for chunk in image_file.chunks():
#                             destination.write(chunk)
                    
#                     # Set full image URL
#                     event_data['image_url'] = f"{settings.SITE_URL}/media/events/{filename}"
#                     print(f"Image saved successfully. URL: {event_data['image_url']}")
                    
#                 except Exception as e:
#                     print(f"Error processing image: {str(e)}")
#                     return Response({
#                         'error': f'Error processing image: {str(e)}'
#                     }, status=status.HTTP_400_BAD_REQUEST)

#             # Convert numeric fields
#             try:
#                 if 'ticket_price' in event_data:
#                     event_data['ticket_price'] = float(event_data['ticket_price'])
#                 if 'max_attendees' in event_data:
#                     event_data['max_attendees'] = int(event_data['max_attendees'])
#                 print(f"Numeric fields converted successfully")
#             except ValueError as e:
#                 print(f"Error converting numeric fields: {str(e)}")
#                 return Response({
#                     'error': f'Invalid numeric value: {str(e)}'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Update event
#             print("Calling update_event...")
#             success, message = update_event(event_id, user_id, event_data)
#             print(f"Update result - Success: {success}, Message: {message}")
            
#             if not success:
#                 return Response({
#                     'error': message
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Get updated event details
#             print(f"Fetching updated event details with ID: {event_id}")
#             updated_event = get_event(event_id)
#             if not updated_event:
#                 print("Failed to fetch updated event")
#                 return Response({
#                     'error': 'Failed to fetch updated event'
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             print("Event updated successfully")
#             return Response(updated_event, status=status.HTTP_200_OK)

#         except jwt.ExpiredSignatureError:
#             print("Token expired")
#             return Response({
#                 'error': 'Token has expired'
#             }, status=status.HTTP_401_UNAUTHORIZED)
#         except jwt.InvalidTokenError:
#             print("Invalid token")
#             return Response({
#                 'error': 'Invalid token'
#             }, status=status.HTTP_401_UNAUTHORIZED)
#         except Exception as e:
#             print(f"Unexpected error in UpdateEventView: {str(e)}")
#             print(f"Error type: {type(e)}")
#             import traceback
#             print(f"Traceback: {traceback.format_exc()}")
#             return Response({
#                 'error': f'Failed to update event: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateEventView(APIView):
    @token_required
    def put(self, request, event_id):
        try:
            print(f"Updating event with ID: {event_id}")
            print(f"Request data: {request.data}")
            
            # Get user info from token
            token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user_type = payload.get('user_type')
            print(f"User ID from token: {user_id}")
            print(f"User type from token: {user_type}")

            # Check if user is an organizer
            if user_type != 'organizer':
                print("User is not an organizer")
                return Response({
                    'error': 'Only organizers can update events'
                }, status=status.HTTP_403_FORBIDDEN)

            # First check if event exists and user is the organizer
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT organizer_id FROM events WHERE id = %s",
                    [event_id]
                )
                result = cursor.fetchone()
                if not result:
                    print("Event not found")
                    return Response({
                        'error': 'Event not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                if str(result[0]) != str(user_id):
                    print(f"User {user_id} is not the organizer of event {event_id}")
                    return Response({
                        'error': 'You are not authorized to update this event'
                    }, status=status.HTTP_403_FORBIDDEN)

            # Get event data
            event_data = {}
            for field in ['title', 'description', 'category', 'event_date', 'event_time', 
                         'venue', 'address', 'ticket_price', 'max_attendees', 'publication_status', 'image_url']:
                if field in request.data:
                    event_data[field] = request.data[field]
            
            print(f"Processed event data: {event_data}")

            # Update the event
            success, message = update_event(event_id, user_id, event_data)
            if not success:
                return Response({
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get updated event data
            updated_event = get_event(event_id)
            if not updated_event:
                return Response({
                    'error': 'Failed to retrieve updated event'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(updated_event, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error updating event: {str(e)}")
            return Response({
                'error': f'Failed to update event: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteEventView(APIView):
    @token_required
    def delete(self, request, event_id):
        try:
            # Get user info from token
            token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user_type = payload.get('user_type')

            # Check if user is an organizer
            if user_type != 'organizer':
                return Response({
                    'error': 'Only organizers can delete events'
                }, status=status.HTTP_403_FORBIDDEN)

            # Delete event
            success, message = delete_event(event_id, user_id)
            
            if not success:
                return Response({
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'message': message
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in DeleteEventView: {str(e)}")
            return Response({
                'error': f'An error occurred while deleting the event: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventRegistrationView(APIView):
    @token_required
    def post(self, request, event_id):
        try:
            # Get user info from token
            token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')

            # Register for event
            registration_id, message = register_for_event(event_id, user_id, request.data)
            
            if not registration_id:
                return Response({
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Return success response with registration ID
            return Response({
                'registration_id': registration_id,
                'message': message
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in event registration: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegistrationDetailsView(APIView):
    @token_required
    def get(self, request, registration_id):
        try:
            # Get user info from token
            token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user_type = payload.get('user_type')

            # Get registration details
            registration = get_registration_details(registration_id)
            
            if not registration:
                return Response({
                    'error': 'Registration not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Check if user has permission to view details
            if user_type != 'organizer' and registration['user']['username'] != payload.get('username'):
                return Response({
                    'error': 'You do not have permission to view this registration'
                }, status=status.HTTP_403_FORBIDDEN)

            return Response(registration, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in RegistrationDetailsView: {str(e)}")
            return Response({
                'error': f'An error occurred while retrieving registration details: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganizerEventsListView(APIView):
    @token_required
    def get(self, request):
        """Get all events of the logged-in organizer with registration summaries"""
        try:
            # Verify user is organizer
            print(f"User data from token: {request.user}")  # Debug log
            if request.user.get('user_type') != 'organizer':
                return Response({
                    'error': 'Only organizers can access this endpoint'
                }, status=status.HTTP_403_FORBIDDEN)

            organizer_id = request.user.get('user_id')  # Changed from 'id' to 'user_id'
            print(f"Organizer ID: {organizer_id}")  # Debug log

            success, events = get_organizer_events_with_registrations(organizer_id)
            
            if not success:
                return Response({
                    'error': events
                }, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                'events': events
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in view: {str(e)}")  # Debug log
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventRegistrationsListView(APIView):
    @token_required
    def get(self, request, event_id):
        """Get list of all registrations for a specific event"""
        try:
            # Verify user is organizer
            if request.user.get('user_type') != 'organizer':
                return Response({
                    'error': 'Only organizers can access this endpoint'
                }, status=status.HTTP_403_FORBIDDEN)

            # Convert UUID to string if needed
            event_id_str = str(event_id)
            organizer_id = request.user.get('user_id')  # Changed from 'id' to 'user_id'
            success, result = get_event_registrations(event_id_str, organizer_id)
            
            if not success:
                return Response({
                    'error': result
                }, status=status.HTTP_400_BAD_REQUEST)
                
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicEventsView(APIView):
    def get(self, request):
        try:
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('pageSize', 10))
            search_query = request.GET.get('search', '')
            category = request.GET.get('category', '')
            sort_by = request.GET.get('sortBy', 'created')  # created, date, popularity
            sort_order = request.GET.get('sortOrder', 'desc')  # asc, desc

            offset = (page - 1) * page_size

            with connection.cursor() as cursor:
                # Base query for counting total events
                count_query = """
                    SELECT COUNT(*)
                    FROM events e
                    JOIN organizer_profiles op ON e.organizer_id = op.user_id
                """

                # Base query for fetching events
                query = """
                    SELECT 
                        e.id,
                        e.title,
                        e.description,
                        e.event_type,
                        e.category,
                        e.image_url,
                        e.venue,
                        e.event_date,
                        e.event_time,
                        e.ticket_price,
                        e.max_attendees,
                        e.address,
                        e.created_at,
                        e.publication_status,
                        e.slug,
                        op.organization_name,
                        op.profile_picture_url as organizer_image,
                        op.slug as organizer_slug,
                        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registration_count
                    FROM events e
                    JOIN organizer_profiles op ON e.organizer_id = op.user_id
                    WHERE e.publication_status = 'published'
                """

                params = []
                where_conditions = ["e.publication_status = 'published'"]

                # Add search condition if search query exists
                if search_query:
                    search_condition = """
                        (
                            e.title ILIKE %s 
                            OR e.description ILIKE %s
                            OR e.category ILIKE %s
                            OR e.venue ILIKE %s
                            OR op.organization_name ILIKE %s
                        )
                    """
                    search_param = f'%{search_query}%'
                    where_conditions.append(search_condition)
                    params.extend([search_param] * 5)

                # Add category filter if specified
                if category:
                    where_conditions.append("e.category = %s")
                    params.append(category)

                # Add WHERE clause
                query = query.replace("WHERE e.publication_status = 'published'", 
                                   "WHERE " + " AND ".join(where_conditions))
                count_query += " WHERE " + " AND ".join(where_conditions)

                # Add sorting
                if sort_by == 'date':
                    query += f" ORDER BY e.event_date {sort_order.upper()}"
                elif sort_by == 'popularity':
                    query += f" ORDER BY registration_count {sort_order.upper()}"
                else:  # default to created_at
                    query += f" ORDER BY e.created_at {sort_order.upper()}"

                # Add pagination
                query += " LIMIT %s OFFSET %s"
                params.extend([page_size, offset])

                # Get total count
                cursor.execute(count_query, params[:-2] if params else [])
                total_count = cursor.fetchone()[0]

                # Get paginated events
                cursor.execute(query, params)
                events = cursor.fetchall()

                # Format the events data
                formatted_events = []
                for event in events:
                    # Add domain to image URL if it's a relative path
                    image_url = event[5]
                    if image_url and not image_url.startswith('http'):
                        image_url = f"{settings.SITE_URL}{image_url}"

                    formatted_events.append({
                        "id": str(event[0]),
                        "title": event[1],
                        "description": event[2],
                        "eventType": event[3],
                        "category": event[4],
                        "imageUrl": image_url,
                        "venue": event[6],
                        "eventDate": event[7].strftime('%Y-%m-%d') if event[7] else None,
                        "eventTime": event[8].strftime('%H:%M') if event[8] else None,
                        "ticketPrice": float(event[9]) if event[9] else 0,
                        "maxAttendees": event[10],
                        "address": event[11],
                        "createdAt": event[12].isoformat() if event[12] else None,
                        "status": event[13],
                        "slug": event[14],
                        "organizationName": event[15],
                        "organizerImage": event[16],
                        "organizerSlug": event[17],
                        "registrationCount": event[18]
                    })

                return Response({
                    "events": formatted_events,
                    "pagination": {
                        "currentPage": page,
                        "pageSize": page_size,
                        "totalItems": total_count,
                        "totalPages": -(-total_count // page_size)  # Ceiling division
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in PublicEventsView: {str(e)}")
            return Response({
                'error': 'Failed to fetch events'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ImageUploadView(APIView):
#     @token_required
#     def post(self, request):
#         """Upload an image for an event"""
#         try:
#             if 'file' not in request.FILES:
#                 return Response({
#                     'error': 'No image file provided'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             image = request.FILES['file']

#             # Validate file type
#             if not image.content_type.startswith('image/'):
#                 return Response({
#                     'error': 'Invalid file type. Only images are allowed.'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Validate file size (10MB)
#             if image.size > 10 * 1024 * 1024:
#                 return Response({
#                     'error': 'File too large. Maximum size is 10MB.'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Generate unique filename
#             ext = image.name.split('.')[-1]
#             filename = f"{uuid.uuid4()}.{ext}"

#             # Save file to media/events directory
#             filepath = os.path.join('media', 'events', filename)
#             os.makedirs(os.path.dirname(filepath), exist_ok=True)

#             with open(filepath, 'wb+') as destination:
#                 for chunk in image.chunks():
#                     destination.write(chunk)

#             # Return the URL with full domain
#             image_url = f"{settings.SITE_URL}/media/events/{filename}"
#             return Response({
#                 'image_url': image_url
#             }, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             print(f"Error uploading image: {str(e)}")
#             return Response({
#                 'error': f'Failed to upload image: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ImageUploadView(APIView):
    @token_required
    def post(self, request):
        """Upload an image for an event"""
        try:
            if 'file' not in request.FILES:
                return Response({
                    'error': 'No image file provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            image = request.FILES['file']

            # Validate file type
            if not image.content_type.startswith('image/'):
                return Response({
                    'error': 'Invalid file type. Only images are allowed.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate file size (10MB)
            if image.size > 10 * 1024 * 1024:
                return Response({
                    'error': 'File too large. Maximum size is 10MB.'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Upload to Cloudinary
                upload_result = cloudinary.uploader.upload(
                    image,
                    folder="univent/events",  # Organize files in a folder
                    resource_type="image",
                    transformation=[
                        {"quality": "auto:good"},  # Automatic quality optimization
                        {"fetch_format": "auto"},  # Auto-select best format
                        {"width": 800, "crop": "limit"}  # Resize if needed
                    ]
                )
                print("Cloudinary upload result:", upload_result)
                
                if 'secure_url' not in upload_result:
                    raise Exception("No secure URL in Cloudinary response")

                # Return the Cloudinary secure URL
                return Response({
                    'image_url': upload_result['secure_url']
                }, status=status.HTTP_201_CREATED)

            except Exception as cloud_error:
                print(f"Cloudinary upload error: {str(cloud_error)}")
                return Response({
                    'error': f'Failed to upload to Cloudinary: {str(cloud_error)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(f"Error uploading image: {str(e)}")
            return Response({
                'error': f'Failed to upload image: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetEventByIDView(APIView):
    def get(self, request, event_id):
        """
        Get detailed event information by ID.
        This is a public endpoint that doesn't require authentication.
        """
        try:
            print(f"Attempting to get event with ID: {event_id}")
            
            # Validate event_id format
            try:
                import uuid
                uuid.UUID(str(event_id))
            except ValueError:
                return Response({
                    'error': 'Invalid event ID format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get event by ID
            event = get_event(event_id)
            
            if not event:
                print(f"No event found with ID: {event_id}")
                return Response({
                    'error': 'Event not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Convert Decimal to float for JSON serialization
            if 'ticket_price' in event:
                event['ticket_price'] = float(event['ticket_price'])
            
            print(f"Successfully returning event: {event.get('title', 'Unknown')}")
            return Response(event, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error getting event with ID {event_id}: {str(e)}")
            return Response({
                'error': 'Failed to get event',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class GetEventBySlugView(APIView):
#     def get(self, request, slug):
#         event = get_event_by_slug(slug)
        
#         if event is None:
#             return Response(
#                 {"error": "Event not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         return Response(event, status=status.HTTP_200_OK)


class UserRegisteredEventsView(APIView):
    @token_required
    def get(self, request):
        try:
            # Get user ID from the request.user dictionary
            user_id = request.user.get('user_id')
            if not user_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get user's registered events
            registrations = get_user_registered_events(user_id)
            if registrations is None:
                return Response({
                    'error': 'Failed to fetch registered events'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                'registrations': registrations
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in UserRegisteredEventsView: {str(e)}")
            return Response({
                'error': 'Failed to get registered events'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SimpleCheckInView(APIView):

    @token_required
    def post(self, request):
        try:
            # Get organizer ID from the request.user dictionary
            organizer_id = request.user.get('user_id')
            if not organizer_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get registration ID directly from request
            registration_id = request.data.get('registration_id')
            if not registration_id:
                return Response({
                    'error': 'Registration ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Process check-in
            success, message = process_check_in(registration_id, organizer_id)
            
            if success:
                return Response({
                    'message': message,
                    'check_in_time': datetime.now().isoformat()
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Error in SimpleCheckInView: {str(e)}")
            return Response({
                'error': 'Failed to process check-in'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class QRCheckInView(APIView):
    @token_required
    def post(self, request):
        try:
            # Get organizer ID from the request.user dictionary
            organizer_id = request.user.get('user_id')
            if not organizer_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get registration ID directly from request
            registration_id = request.data.get('registration_id')
            if not registration_id:
                return Response({
                    'error': 'Registration ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Process check-in
            success, message = process_check_in(registration_id, organizer_id)
            
            if success:
                # Get registration details for response
                registration_details = get_registration_details(registration_id)
                return Response({
                    'message': message,
                    'check_in_time': datetime.now().isoformat(),
                    'registration_details': registration_details
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Error in QRCheckInView: {str(e)}")
            return Response({
                'error': 'Failed to process check-in'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventParticipantsView(APIView):
    @token_required
    def get(self, request, event_id):
        try:
            # Get organizer ID from the request.user dictionary
            organizer_id = request.user.get('user_id')
            if not organizer_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get event participants
            success, result = get_event_participants(event_id, organizer_id)
            
            if success:
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': result
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Error in EventParticipantsView: {str(e)}")
            return Response({
                'error': 'Failed to get event participants'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganizerDashboardView(APIView):
    @token_required
    def get(self, request):
        try:
            # Get organizer ID from the request.user dictionary
            organizer_id = request.user.get('user_id')
            if not organizer_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get dashboard data
            success, result = get_organizer_dashboard(organizer_id)
            
            if success:
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': result
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Error in OrganizerDashboardView: {str(e)}")
            return Response({
                'error': 'Failed to get dashboard data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDashboardView(APIView):
    @token_required
    def get(self, request):
        try:
            user_id = request.user.get('user_id')
            if not user_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            current_date = datetime.now().date()
            current_time = datetime.now().time()
            
            with connection.cursor() as cursor:
                # Get total events count (both upcoming and past)
                cursor.execute("""
                    SELECT COUNT(DISTINCT e.id)
                    FROM event_registrations er
                    JOIN events e ON er.event_id = e.id
                    WHERE er.attendee_id = %s
                """, [user_id])
                total_events = cursor.fetchone()[0]

                # Get active (upcoming) events count
                cursor.execute("""
                    SELECT COUNT(DISTINCT e.id)
                    FROM event_registrations er
                    JOIN events e ON er.event_id = e.id
                    WHERE er.attendee_id = %s
                    AND (e.event_date > %s 
                         OR (e.event_date = %s AND e.event_time > %s))
                """, [user_id, current_date, current_date, current_time])
                active_events = cursor.fetchone()[0]

                # Get total amount spent
                cursor.execute("""
                    SELECT COALESCE(SUM(total_amount), 0)
                    FROM event_registrations
                    WHERE attendee_id = %s
                """, [user_id])
                total_spent = cursor.fetchone()[0]

                # Get total seats booked
                cursor.execute("""
                    SELECT COALESCE(SUM(number_of_seats), 0)
                    FROM event_registrations
                    WHERE attendee_id = %s
                """, [user_id])
                total_seats = cursor.fetchone()[0]

                # Get total events checked in
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM event_registrations
                    WHERE attendee_id = %s AND check_in_status = true
                """, [user_id])
                total_checked_in = cursor.fetchone()[0]

                # Get upcoming events
                cursor.execute("""
                    SELECT 
                        e.id,
                        e.title,
                        e.event_date,
                        e.event_time,
                        e.venue,
                        e.max_attendees,
                        e.image_url,
                        er.number_of_seats as booked_seats,
                        er.qr_code,
                        er.ticket_pdf,
                        er.total_amount,
                        er.status,
                        er.check_in_status
                    FROM event_registrations er
                    JOIN events e ON er.event_id = e.id
                    WHERE er.attendee_id = %s
                    AND (e.event_date > %s 
                         OR (e.event_date = %s AND e.event_time > %s))
                    ORDER BY e.event_date ASC, e.event_time ASC
                    LIMIT 5
                """, [user_id, current_date, current_date, current_time])
                
                upcoming_events = []
                for row in cursor.fetchall():
                    event_datetime = datetime.combine(row[2], row[3])
                    upcoming_events.append({
                        'id': row[0],
                        'title': row[1],
                        'event_date': row[2].isoformat(),
                        'event_time': str(row[3]),
                        'venue': row[4],
                        'max_attendees': row[5],
                        'image_url': row[6],
                        'booked_seats': row[7],
                        'qr_code': row[8],
                        'ticket_pdf': row[9],
                        'total_amount': float(row[10]),
                        'status': row[11],
                        'checked_in': row[12],
                        'event_datetime': event_datetime.isoformat()
                    })

                # Get recent registrations
                cursor.execute("""
                    SELECT 
                        er.id as registration_id,
                        e.title as event_title,
                        er.registration_date,
                        er.number_of_seats,
                        er.total_amount,
                        er.qr_code,
                        er.ticket_pdf,
                        er.status,
                        er.check_in_status
                    FROM event_registrations er
                    JOIN events e ON er.event_id = e.id
                    WHERE er.attendee_id = %s
                    ORDER BY er.registration_date DESC
                    LIMIT 5
                """, [user_id])
                
                recent_registrations = []
                for row in cursor.fetchall():
                    recent_registrations.append({
                        'registration_id': row[0],
                        'event_title': row[1],
                        'registration_date': row[2].isoformat(),
                        'number_of_seats': row[3],
                        'total_amount': float(row[4]),
                        'qr_code': row[5],
                        'ticket_pdf': row[6],
                        'status': row[7],
                        'checked_in': row[8]
                    })

            return Response({
                'total_events': total_events,
                'active_events': active_events,
                'total_spent': float(total_spent),
                'total_seats': total_seats,
                'total_checked_in': total_checked_in,
                'upcoming_events': upcoming_events,
                'recent_registrations': recent_registrations
            })

        except Exception as e:
            print(f"Error in UserDashboardView: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicEventDetailView(APIView):
    def get(self, request, slug):
        """
        Get detailed event information by slug.
        This is a public endpoint that doesn't require authentication.
        """
        try:
            print(f"[PublicEventDetailView] Attempting to get event with slug: {slug}")
            
            # Get event by slug
            event = get_event_by_slug(slug)
            
            if not event:
                print(f"[PublicEventDetailView] No event found with slug: {slug}")
                return Response({
                    'error': 'Event not found',
                    'slug': slug
                }, status=status.HTTP_404_NOT_FOUND)
            
            print(f"[PublicEventDetailView] Successfully found event: {event.get('title', 'Unknown')}")
            return Response(event, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"[PublicEventDetailView] Error getting event with slug {slug}: {str(e)}")
            return Response({
                'error': 'Failed to get event',
                'detail': str(e),
                'slug': slug
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_ticket(request, registration_id):
    try:
        # Get registration details
        registration = get_registration_details(registration_id)
        if not registration:
            return Response({'error': 'Registration not found'}, status=404)
            
        # Generate PDF
        pdf_file = generate_ticket_pdf(registration)
        
        # Create response
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="ticket_{registration_id}.pdf"'
        return response
        
    except Exception as e:
        print(f"Error downloading ticket: {str(e)}")
        return Response({'error': str(e)}, status=500)


class ToggleCheckInView(APIView):
    @token_required
    def post(self, request, registration_id):
        try:
            # Get organizer ID from the request.user dictionary
            organizer_id = request.user.get('user_id')
            if not organizer_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Toggle check-in status in the database
            with connection.cursor() as cursor:
                # First verify if this registration belongs to an event owned by the organizer
                cursor.execute("""
                    SELECT e.id, er.check_in_status
                    FROM events e
                    JOIN event_registrations er ON e.id = er.event_id
                    WHERE er.id = %s AND e.organizer_id = %s;
                """, [str(registration_id), organizer_id])  # Convert UUID to string
                
                result = cursor.fetchone()
                if not result:
                    return Response({
                        'error': 'Unauthorized: You are not the organizer of this event'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                current_status = result[1]
                new_status = not current_status
                
                # Update the check-in status
                cursor.execute("""
                    UPDATE event_registrations
                    SET check_in_status = %s,
                        check_in_time = CASE 
                            WHEN %s = true THEN NOW()
                            ELSE NULL
                        END
                    WHERE id = %s
                    RETURNING check_in_status, check_in_time;
                """, [new_status, new_status, str(registration_id)])  # Convert UUID to string
                
                updated = cursor.fetchone()
                
                return Response({
                    'success': True,
                    'registration_id': str(registration_id),  # Convert UUID to string
                    'check_in_status': updated[0],
                    'check_in_time': updated[1].isoformat() if updated[1] else None
                }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in ToggleCheckInView: {str(e)}")
            return Response({
                'error': 'Failed to toggle check-in status'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
