from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from .db_manager import (
    create_notification, get_user_notifications, mark_notification_as_read,
    get_unread_count, create_event_notification, get_event_notifications
)
from accounts.middleware import token_required
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class NotificationsView(APIView):
    @token_required
    def get(self, request, event_id=None):
        """Get notifications for a user or event"""
        try:
            user_id = request.user.get('user_id')
            if not user_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            if event_id:
                # Get event-specific notifications
                notifications = get_event_notifications(event_id)
                unread_count = 0  # We'll implement this later if needed
            else:
                # Get all notifications for the user
                notifications = get_user_notifications(user_id)
                unread_count = get_unread_count(user_id)
            
            return Response({
                'notifications': notifications,
                'unread_count': unread_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting notifications: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @token_required
    def post(self, request):
        """Create a new notification"""
        try:
            user_id = request.user.get('user_id')
            user_type = request.user.get('user_type')

            if not user_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            if user_type != 'organizer':
                return Response({
                    'error': 'Only organizers can send notifications'
                }, status=status.HTTP_403_FORBIDDEN)

            data = request.data
            required_fields = ['recipient_id', 'title', 'message']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return Response({
                    'error': f"Missing required fields: {', '.join(missing_fields)}"
                }, status=status.HTTP_400_BAD_REQUEST)

            notification_data = {
                'sender_id': user_id,
                'recipient_id': data['recipient_id'],
                'title': data['title'],
                'message': data['message'],
                'notification_type': data.get('notification_type', 'event'),
                'event_id': data.get('event_id')
            }

            notification_id = create_notification(notification_data)
            return Response({
                'message': 'Notification created successfully',
                'notification_id': notification_id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NotificationReadView(APIView):
    @token_required
    def post(self, request, notification_id):
        """Mark a notification as read"""
        try:
            user_id = request.user.get('user_id')
            if not user_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            success = mark_notification_as_read(notification_id, user_id)
            if not success:
                return Response({
                    'error': 'Notification not found or unauthorized'
                }, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'message': 'Notification marked as read'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UnreadCountView(APIView):
    @token_required
    def get(self, request):
        """Get count of unread notifications"""
        try:
            user_id = request.user.get('user_id')
            if not user_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            count = get_unread_count(user_id)
            return Response({
                'unread_count': count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EventNotificationView(APIView):
    @token_required
    def post(self, request, event_id):
        """Send notification to all participants of an event"""
        try:
            print("\n=== Starting Notification Creation ===")
            print(f"Event ID: {event_id}")
            print(f"Request Data: {request.data}")
            print(f"User: {request.user}")
            
            user_id = request.user.get('user_id')
            user_type = request.user.get('user_type')

            print(f"User ID: {user_id}")
            print(f"User Type: {user_type}")

            if not user_id:
                print("Error: User ID not found")
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            if user_type != 'organizer':
                print(f"Error: Unauthorized user type: {user_type}")
                return Response({
                    'error': 'Only organizers can send notifications'
                }, status=status.HTTP_403_FORBIDDEN)

            # Get notification data from request
            notification_data = request.data
            print(f"\nNotification Data:")
            print(f"Title: {notification_data.get('title')}")
            print(f"Message: {notification_data.get('message')}")
            print(f"Type: {notification_data.get('notification_type')}")

            if not notification_data.get('title') or not notification_data.get('message'):
                print("Error: Missing title or message")
                return Response({
                    'error': 'Title and message are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # First check if the event exists and user is authorized
            with connection.cursor() as cursor:
                print("\nChecking event authorization...")
                cursor.execute("""
                    SELECT id FROM events 
                    WHERE id = %s AND organizer_id = %s
                """, [event_id, user_id])
                event = cursor.fetchone()
                print(f"Event found: {event is not None}")
                
                if not event:
                    print(f"Error: Event not found or unauthorized. Event: {event_id}, User: {user_id}")
                    return Response({
                        'error': 'Event not found or unauthorized'
                    }, status=status.HTTP_404_NOT_FOUND)

                # Check if event has any participants
                cursor.execute("""
                    SELECT COUNT(*) FROM event_registrations
                    WHERE event_id = %s AND status = 'approved'
                """, [event_id])
                participant_count = cursor.fetchone()[0]
                print(f"Found {participant_count} approved participants")

            try:
                print("\nCreating notifications...")
                # Create notifications
                sent_count = create_event_notification(
                    event_id, 
                    user_id,
                    notification_data.get('title'),
                    notification_data.get('message'),
                    notification_data.get('notification_type', 'general')
                )
                print(f"Successfully created {sent_count} notifications")
                
                # Get updated notifications for the event
                notifications = get_event_notifications(event_id)
                print(f"Retrieved {len(notifications)} notifications for event")
                
                print("\n=== Notification Creation Complete ===")
                return Response({
                    'message': f'Notification sent to {sent_count} participants',
                    'participant_count': sent_count,
                    'notifications': notifications
                }, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"\nError creating notification: {str(e)}")
                return Response({
                    'error': 'Failed to create notification',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(f"\nError in notification view: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
