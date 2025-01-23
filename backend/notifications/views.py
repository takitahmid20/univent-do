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

# Create your views here.

class NotificationsView(APIView):
    @token_required
    def get(self, request, event_id=None):
        try:
            user_id = request.user.get('user_id')
            if not user_id:
                return Response({
                    'error': 'User ID not found'
                }, status=status.HTTP_400_BAD_REQUEST)

            if event_id:
                # Get notifications for a specific event
                notifications = get_event_notifications(event_id)
            else:
                # Get all notifications for the user
                notifications = get_user_notifications(user_id)
            
            return Response({
                'notifications': notifications,
                'unread_count': get_unread_count(user_id)
            }, status=status.HTTP_200_OK)
        except Exception as e:
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

            # Verify that the user is the organizer of this event
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id FROM events 
                    WHERE id = %s AND organizer_id = %s
                """, [event_id, user_id])
                if not cursor.fetchone():
                    return Response({
                        'error': 'Event not found or unauthorized'
                    }, status=status.HTTP_404_NOT_FOUND)

            participant_count = create_event_notification(event_id, user_id)
            return Response({
                'message': f'Notification sent to {participant_count} participants'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
