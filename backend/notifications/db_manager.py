import logging
from django.db import connection
from datetime import datetime

logger = logging.getLogger(__name__)

def dictfetchone(cursor):
    """Return a dictionary from a database row"""
    desc = cursor.description
    if not desc:
        return None
    
    row = cursor.fetchone()
    if not row:
        return None
    
    return dict(zip([col[0] for col in desc], row))

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dictionaries"""
    desc = cursor.description
    return [
        dict(zip([col[0] for col in desc], row))
        for row in cursor.fetchall()
    ]

def setup_database():
    """Create necessary tables for notifications if they don't exist"""
    try:
        print("Starting to create notifications tables...")
        with connection.cursor() as cursor:
            # Create tables
            cursor.execute("""
                -- Create notifications table
                CREATE TABLE IF NOT EXISTS notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    notification_type VARCHAR(50) DEFAULT 'event' CHECK (notification_type IN ('event', 'system', 'other')),
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                -- Create index on recipient_id for faster querying
                CREATE INDEX IF NOT EXISTS idx_notifications_recipient 
                ON notifications(recipient_id);

                -- Create index on event_id for faster querying
                CREATE INDEX IF NOT EXISTS idx_notifications_event 
                ON notifications(event_id);
            """)
            print("✅ Notifications tables created successfully")

    except Exception as e:
        print(f"❌ Error setting up notifications database: {str(e)}")
        raise e

def create_notification(notification_data):
    """Create a new notification"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO notifications (
                    event_id, sender_id, recipient_id, 
                    title, message, notification_type
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, [
                notification_data.get('event_id'),
                notification_data['sender_id'],
                notification_data['recipient_id'],
                notification_data['title'],
                notification_data['message'],
                notification_data.get('notification_type', 'event')
            ])
            notification_id = cursor.fetchone()[0]
            return notification_id
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        raise e

def get_user_notifications(user_id, limit=10, offset=0):
    """Get notifications for a specific user"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    n.*,
                    e.title as event_title,
                    u.username as sender_name
                FROM notifications n
                LEFT JOIN events e ON n.event_id = e.id
                LEFT JOIN users u ON n.sender_id = u.id
                WHERE n.recipient_id = %s
                ORDER BY n.created_at DESC
                LIMIT %s OFFSET %s
            """, [user_id, limit, offset])
            return dictfetchall(cursor)
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        raise e

def mark_notification_as_read(notification_id, user_id):
    """Mark a notification as read"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE id = %s AND recipient_id = %s
                RETURNING id
            """, [notification_id, user_id])
            return cursor.fetchone() is not None
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        raise e

def get_unread_count(user_id):
    """Get count of unread notifications for a user"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM notifications 
                WHERE recipient_id = %s AND is_read = FALSE
            """, [user_id])
            return cursor.fetchone()[0]
    except Exception as e:
        logger.error(f"Error getting unread count: {str(e)}")
        raise e

def create_event_notification(event_id, sender_id):
    """Create notifications for all participants of an event"""
    try:
        with connection.cursor() as cursor:
            # First get event details
            cursor.execute("""
                SELECT title FROM events WHERE id = %s
            """, [event_id])
            event = dictfetchone(cursor)
            if not event:
                raise Exception("Event not found")

            # Get all participants
            cursor.execute("""
                SELECT DISTINCT attendee_id
                FROM event_registrations
                WHERE event_id = %s
            """, [event_id])
            participants = cursor.fetchall()

            # Create notification for each participant
            for participant in participants:
                notification_data = {
                    'event_id': event_id,
                    'sender_id': sender_id,
                    'recipient_id': participant[0],
                    'title': f"New notification for {event['title']}",
                    'message': f"The organizer has sent a new notification regarding the event: {event['title']}",
                    'notification_type': 'event'
                }
                create_notification(notification_data)

            return len(participants)
    except Exception as e:
        logger.error(f"Error creating event notifications: {str(e)}")
        raise e

def get_event_notifications(event_id):
    """Get all notifications for a specific event"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                n.id, n.title, n.message, n.notification_type, n.created_at, n.is_read,
                u.username as sender_name, u.email as sender_email
            FROM notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            WHERE n.event_id = %s
            ORDER BY n.created_at DESC
        """, [event_id])
        
        columns = [col[0] for col in cursor.description]
        notifications = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
        
        # Convert datetime to string for JSON serialization
        for notification in notifications:
            notification['created_at'] = notification['created_at'].isoformat()
            notification['id'] = str(notification['id'])  # Convert UUID to string
        
        return notifications
