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
            # Drop existing check constraint if it exists
            cursor.execute("""
                DO $$ BEGIN
                    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_notification_type_check;
                EXCEPTION
                    WHEN undefined_table THEN
                        NULL;
                END $$;
            """)

            # Create table with updated constraint
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    notification_type VARCHAR(50) DEFAULT 'general',
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                -- Create index on recipient_id for faster querying
                CREATE INDEX IF NOT EXISTS idx_notifications_recipient 
                ON notifications(recipient_id);
            """)

            # Add new check constraint
            cursor.execute("""
                DO $$ BEGIN
                    ALTER TABLE notifications 
                    ADD CONSTRAINT notifications_notification_type_check 
                    CHECK (notification_type IN ('general', 'important', 'update', 'reminder', 'system', 'event'));
                EXCEPTION
                    WHEN duplicate_object THEN
                        NULL;
                END $$;
            """)

            print("Successfully set up notifications table")
    except Exception as e:
        print(f"Error setting up database: {str(e)}")
        raise e

def create_notification(notification_data):
    """Create a new notification"""
    try:
        print("\n--- Creating Single Notification ---")
        print(f"Data: {notification_data}")
        
        with connection.cursor() as cursor:
            # First verify the recipient exists
            print("Verifying recipient...")
            cursor.execute("""
                SELECT id FROM users WHERE id = %s
            """, [notification_data['recipient_id']])
            recipient = cursor.fetchone()
            print(f"Recipient exists: {recipient is not None}")

            if not recipient:
                print(f"Error: Recipient {notification_data['recipient_id']} not found")
                raise Exception(f"Recipient {notification_data['recipient_id']} not found")

            print("Inserting notification...")
            cursor.execute("""
                INSERT INTO notifications (
                    event_id, sender_id, recipient_id, 
                    title, message, notification_type,
                    is_read, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, false, CURRENT_TIMESTAMP)
                RETURNING id;
            """, [
                notification_data['event_id'],
                notification_data['sender_id'],
                notification_data['recipient_id'],
                notification_data['title'],
                notification_data['message'],
                notification_data.get('notification_type', 'general')
            ])
            notification_id = cursor.fetchone()[0]
            print(f"Successfully created notification: {notification_id}")
            return notification_id
    except Exception as e:
        print(f"Error in create_notification: {str(e)}")
        raise e

def get_user_notifications(user_id, limit=10, offset=0):
    """Get notifications for a specific user"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    n.id,
                    n.title,
                    n.message,
                    n.notification_type,
                    n.is_read,
                    n.created_at,
                    u.email as sender_email,
                    u.username as sender_username,
                    e.title as event_title,
                    e.id as event_id
                FROM notifications n
                JOIN users u ON n.sender_id = u.id
                LEFT JOIN events e ON n.event_id = e.id
                WHERE n.recipient_id = %s
                ORDER BY n.created_at DESC
                LIMIT %s OFFSET %s;
            """, [user_id, limit, offset])
            
            notifications = []
            for row in cursor.fetchall():
                notifications.append({
                    'id': row[0],
                    'title': row[1],
                    'message': row[2],
                    'type': row[3],
                    'is_read': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'sender': {
                        'email': row[6],
                        'username': row[7]
                    },
                    'event': {
                        'id': row[9],
                        'title': row[8]
                    } if row[9] else None
                })
            
            print(f"Retrieved {len(notifications)} notifications for user {user_id}")
            return notifications
    except Exception as e:
        print(f"Error getting user notifications: {str(e)}")
        return []

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

def create_event_notification(event_id, sender_id, title, message, notification_type='general'):
    """Create notifications for all participants of an event"""
    try:
        print("\n=== Creating Event Notification ===")
        print(f"Event ID: {event_id}")
        print(f"Sender ID: {sender_id}")
        print(f"Title: {title}")
        print(f"Message: {message}")
        print(f"Type: {notification_type}")

        with connection.cursor() as cursor:
            # First verify the event exists
            print("\nVerifying event exists...")
            cursor.execute("""
                SELECT id FROM events WHERE id = %s
            """, [event_id])
            event = cursor.fetchone()
            print(f"Event exists: {event is not None}")

            if not event:
                print(f"Error: Event {event_id} not found")
                raise Exception("Event not found")

            # Get all participants including the event organizer
            print("\nFetching participants...")
            cursor.execute("""
                SELECT DISTINCT er.attendee_id
                FROM event_registrations er
                WHERE er.event_id = %s
                  AND er.status = 'approved'
                UNION
                SELECT e.organizer_id
                FROM events e
                WHERE e.id = %s
            """, [event_id, event_id])
            
            participants = cursor.fetchall()
            print(f"Found {len(participants)} participants")
            print("Participant IDs:", [p[0] for p in participants])

            if not participants:
                print("Warning: No participants found")
                return 0

            # Create notification for each participant
            notification_count = 0
            print("\nCreating notifications for participants...")
            for participant in participants:
                try:
                    participant_id = participant[0]
                    print(f"\nCreating notification for participant: {participant_id}")
                    notification_data = {
                        'event_id': event_id,
                        'sender_id': sender_id,
                        'recipient_id': participant_id,
                        'title': title,
                        'message': message,
                        'notification_type': notification_type
                    }
                    notification_id = create_notification(notification_data)
                    print(f"Created notification: {notification_id}")
                    notification_count += 1
                except Exception as e:
                    print(f"Error creating notification for participant {participant_id}: {str(e)}")
                    continue

            print(f"\nSuccessfully created {notification_count} notifications")
            print("=== Event Notification Creation Complete ===")
            return notification_count
    except Exception as e:
        print(f"Error in create_event_notification: {str(e)}")
        raise e

def get_event_notifications(event_id):
    """Get all notifications for an event"""
    try:
        with connection.cursor() as cursor:
            # Get all unique notifications for this event
            cursor.execute("""
                WITH RankedNotifications AS (
                    SELECT 
                        n.id,
                        n.title,
                        n.message,
                        n.notification_type,
                        n.is_read,
                        n.created_at,
                        n.sender_id,
                        n.recipient_id,
                        ROW_NUMBER() OVER (
                            PARTITION BY n.title, n.message, n.sender_id 
                            ORDER BY n.created_at DESC
                        ) as rn
                    FROM notifications n
                    WHERE n.event_id = %s
                )
                SELECT 
                    rn.id,
                    rn.title,
                    rn.message,
                    rn.notification_type,
                    rn.is_read,
                    rn.created_at,
                    u.email as sender_email,
                    u.username as sender_username
                FROM RankedNotifications rn
                JOIN users u ON rn.sender_id = u.id
                WHERE rn.rn = 1
                ORDER BY rn.created_at DESC;
            """, [event_id])
            
            notifications = []
            for row in cursor.fetchall():
                notification = {
                    'id': row[0],
                    'title': row[1],
                    'message': row[2],
                    'type': row[3],
                    'is_read': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'sender': {
                        'email': row[6],
                        'username': row[7]
                    }
                }
                notifications.append(notification)
            
            print(f"Retrieved {len(notifications)} unique notifications for event {event_id}")
            for n in notifications:
                print(f"Notification: {n['id']} - {n['title']} - {n['created_at']}")
            
            return notifications
    except Exception as e:
        print(f"Error getting event notifications: {str(e)}")
        return []
