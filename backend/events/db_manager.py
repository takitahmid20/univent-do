import logging
import psycopg2
import uuid
import qrcode
import io
import base64
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
    """Create necessary tables for events if they don't exist"""
    try:
        print("Starting to create events tables...")
        with connection.cursor() as cursor:
            # First check if tables exist
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'events'
                );
            """)
            events_exists = cursor.fetchone()[0]
            print(f"Events table exists: {events_exists}")

            # Create tables
            print("Creating/updating tables...")
            cursor.execute("""
                -- Create events table
                CREATE TABLE IF NOT EXISTS events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    category VARCHAR(100) NOT NULL,
                    event_type VARCHAR(50) NOT NULL DEFAULT 'public',
                    venue VARCHAR(255) NOT NULL,
                    address TEXT NOT NULL,
                    event_date DATE NOT NULL,
                    event_time TIME NOT NULL,
                    ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
                    max_attendees INTEGER,
                    image_url TEXT,
                    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
                    publication_status VARCHAR(20) DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published')),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT;
                UPDATE events SET slug = LOWER(REPLACE(title, ' ', '-')) WHERE slug = '';
                ALTER TABLE events ALTER COLUMN slug SET NOT NULL;

                -- Create event registrations table
                CREATE TABLE IF NOT EXISTS event_registrations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                    attendee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    number_of_seats INTEGER NOT NULL DEFAULT 1,
                    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
                    additional_info TEXT,
                    dietary_requirements TEXT,
                    t_shirt_size VARCHAR(10),
                    qr_code TEXT,
                    ticket_pdf TEXT,
                    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
                    UNIQUE(event_id, attendee_id)
                );
            """)
            print("Event registrations table created/updated successfully")

            # Drop and recreate if columns are missing
            cursor.execute("""
                DO $$ 
                BEGIN 
                    -- Add qr_code column if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 'qr_code'
                    ) THEN
                        ALTER TABLE event_registrations ADD COLUMN qr_code TEXT;
                    END IF;

                    -- Add number_of_seats column if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 'number_of_seats'
                    ) THEN
                        ALTER TABLE event_registrations ADD COLUMN number_of_seats INTEGER NOT NULL DEFAULT 1;
                    END IF;

                    -- Add total_amount column if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 'total_amount'
                    ) THEN
                        ALTER TABLE event_registrations ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
                    END IF;

                    -- Add dietary_requirements column if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 'dietary_requirements'
                    ) THEN
                        ALTER TABLE event_registrations ADD COLUMN dietary_requirements TEXT;
                    END IF;

                    -- Add t_shirt_size column if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 't_shirt_size'
                    ) THEN
                        ALTER TABLE event_registrations ADD COLUMN t_shirt_size VARCHAR(10);
                    END IF;

                    -- Add check_in_status if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 'check_in_status'
                    ) THEN
                        ALTER TABLE event_registrations 
                        ADD COLUMN check_in_status BOOLEAN DEFAULT FALSE;
                    END IF;

                    -- Add check_in_time if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 'check_in_time'
                    ) THEN
                        ALTER TABLE event_registrations 
                        ADD COLUMN check_in_time TIMESTAMP WITH TIME ZONE;
                    END IF;

                    -- Add ticket_pdf if it doesn't exist
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'event_registrations' AND column_name = 'ticket_pdf'
                    ) THEN
                        ALTER TABLE event_registrations 
                        ADD COLUMN ticket_pdf TEXT;
                    END IF;
                END $$;
            """)
            print("Added missing columns if any")
            
            return True
    except Exception as e:
        print(f"Error setting up database: {str(e)}")
        return False

def generate_unique_slug(title):
    """Generate a unique slug for an event"""
    try:
        # Create base slug from title
        base_slug = title.lower().replace(' ', '-')
        
        # Add timestamp to make it unique
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        unique_slug = f"{base_slug}-{timestamp}"
        
        return unique_slug
    except Exception as e:
        logger.error(f"Error generating unique slug: {str(e)}")
        return None

def create_event(event_data):
    """Create a new event"""
    try:
        with connection.cursor() as cursor:
            # Generate unique slug
            unique_slug = generate_unique_slug(event_data['title'])
            if not unique_slug:
                return None
            
            cursor.execute("""
                INSERT INTO events (
                    title, description, organizer_id, category, event_type,
                    venue, address, event_date, event_time, ticket_price,
                    max_attendees, image_url, publication_status, slug
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                ) RETURNING id;
            """, [
                event_data['title'],
                event_data['description'],
                event_data['organizer_id'],
                event_data['category'],
                event_data.get('event_type', 'public'),
                event_data['venue'],
                event_data['address'],
                event_data['event_date'],
                event_data['event_time'],
                event_data.get('ticket_price', 0),
                event_data.get('max_attendees'),
                event_data.get('image_url'),
                event_data.get('publication_status', 'draft'),
                unique_slug
            ])
            event_id = cursor.fetchone()[0]
            return event_id
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        return None

def get_event(event_id):
    """Get event by ID"""
    print(f"DB: Fetching event with ID: {event_id}")
    
    try:
        with connection.cursor() as cursor:
            # First check if event exists
            cursor.execute(
                "SELECT id FROM events WHERE id = %s",
                [event_id]
            )
            if not cursor.fetchone():
                print("DB: No event found with this ID")
                return None

            query = """
                SELECT 
                    e.*, 
                    u.username as organizer_name,
                    COUNT(DISTINCT r.id) as total_registrations,
                    COALESCE(SUM(r.number_of_seats), 0) as total_seats_booked
                FROM events e
                LEFT JOIN users u ON e.organizer_id = u.id
                LEFT JOIN event_registrations r ON e.id = r.event_id
                WHERE e.id = %s
                GROUP BY e.id, u.id, u.username;
            """
            print(f"DB: Executing query with ID: {event_id}")
            cursor.execute(query, [event_id])
            event = dictfetchone(cursor)
            
            if not event:
                print("DB: No event found")
                return None
                
            # Convert date and time to string format
            if event:
                event['event_date'] = event['event_date'].isoformat() if event['event_date'] else None
                event['event_time'] = event['event_time'].strftime('%H:%M:%S') if event['event_time'] else None
                event['created_at'] = event['created_at'].isoformat() if event['created_at'] else None
                event['updated_at'] = event['updated_at'].isoformat() if event['updated_at'] else None
                
                # Convert numeric fields to proper format
                event['ticket_price'] = float(event['ticket_price']) if event['ticket_price'] else 0
                event['max_attendees'] = int(event['max_attendees']) if event['max_attendees'] else None
                
                # Ensure all fields exist
                event['title'] = event.get('title', '')
                event['description'] = event.get('description', '')
                event['category'] = event.get('category', '')
                event['venue'] = event.get('venue', '')
                event['address'] = event.get('address', '')
                
                # Handle image field
                event['image_url'] = event.get('image_url', None)
                event['banner_image'] = event.get('image_url', None)  # For compatibility
                
                event['publication_status'] = event.get('publication_status', 'draft')
            
            print(f"DB: Successfully fetched event: {event.get('title', 'Unknown')}")
            return event
            
    except Exception as e:
        print(f"DB Error: {str(e)}")
        return None

def get_organizer_events(organizer_id):
    """Get all events created by an organizer"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    e.id, e.title, e.description, e.category, 
                    e.event_type, e.venue, e.address,
                    e.event_date, e.event_time, e.ticket_price,
                    e.max_attendees, e.image_url, e.status,
                    e.publication_status, e.slug,
                    e.created_at, e.updated_at,
                    COUNT(er.id) as registered_attendees
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.organizer_id = %s
                GROUP BY e.id
                ORDER BY e.created_at DESC;
            """, [organizer_id])
            
            events = []
            for row in cursor.fetchall():
                events.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'category': row[3],
                    'event_type': row[4],
                    'venue': row[5],
                    'address': row[6],
                    'event_date': row[7],
                    'event_time': row[8],
                    'ticket_price': float(row[9]),
                    'max_attendees': row[10],
                    'image_url': row[11],
                    'status': row[12],
                    'publication_status': row[13],
                    'slug': row[14],
                    'created_at': row[15],
                    'updated_at': row[16],
                    'registered_attendees': row[17]
                })
            return events
    except Exception as e:
        logger.error(f"Error getting organizer events: {str(e)}")
        return None

def update_event(event_id, user_id, event_data):
    """Update event by ID"""
    print(f"DB: Updating event with ID: {event_id}")
    
    try:
        with connection.cursor() as cursor:
            # First verify the user is the organizer
            cursor.execute(
                "SELECT organizer_id FROM events WHERE id = %s",
                [event_id]
            )
            result = cursor.fetchone()
            
            if not result:
                print("DB: Event not found")
                return False, "Event not found"
                
            if str(result[0]) != str(user_id):
                print(f"DB: User {user_id} is not the organizer of event {event_id}")
                return False, "You are not authorized to update this event"
            
            # Update the event
            query = """
                UPDATE events 
                SET title = COALESCE(%s, title),
                    description = COALESCE(%s, description),
                    event_date = COALESCE(%s, event_date),
                    event_time = COALESCE(%s, event_time),
                    venue = COALESCE(%s, venue),
                    address = COALESCE(%s, address),
                    category = COALESCE(%s, category),
                    ticket_price = COALESCE(%s, ticket_price),
                    max_attendees = COALESCE(%s, max_attendees),
                    image_url = CASE 
                        WHEN %s IS NOT NULL THEN %s 
                        ELSE image_url 
                    END,
                    publication_status = COALESCE(%s, publication_status),
                    updated_at = NOW()
                WHERE id = %s AND organizer_id = %s
                RETURNING id, image_url;
            """
            
            image_url = event_data.get('image_url')
            print(f"DB: Image URL to update: {image_url}")
            
            cursor.execute(query, [
                event_data.get('title'),
                event_data.get('description'),
                event_data.get('event_date'),
                event_data.get('event_time'),
                event_data.get('venue'),
                event_data.get('address'),
                event_data.get('category'),
                event_data.get('ticket_price'),
                event_data.get('max_attendees'),
                image_url,  # For the CASE WHEN check
                image_url,  # For the actual value
                event_data.get('publication_status', 'draft'),
                event_id,
                user_id
            ])
            
            updated = cursor.fetchone()
            if updated:
                print("DB: Event updated successfully")
                print(f"DB: Updated image URL: {updated[1]}")  # Log the updated image URL
                return True, "Event updated successfully"
            print("DB: Failed to update event")
            return False, "Failed to update event"
            
    except Exception as e:
        print(f"DB Error: {str(e)}")
        return False, str(e)

def delete_event(event_id, organizer_id):
    """Delete an event and its related data"""
    try:
        with connection.cursor() as cursor:
            # First check if event exists and belongs to organizer
            cursor.execute("""
                SELECT id FROM events 
                WHERE id = %s AND organizer_id = %s;
            """, [event_id, organizer_id])
            
            if not cursor.fetchone():
                return False, "Event not found or you don't have permission to delete it"
            
            # Delete event registrations first (due to foreign key constraint)
            cursor.execute("""
                DELETE FROM event_registrations 
                WHERE event_id = %s;
            """, [event_id])
            
            # Delete the event
            cursor.execute("""
                DELETE FROM events 
                WHERE id = %s AND organizer_id = %s
                RETURNING id;
            """, [event_id, organizer_id])
            
            deleted_id = cursor.fetchone()
            
            if deleted_id:
                return True, "Event deleted successfully"
            return False, "Failed to delete event"
            
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return False, str(e)

def check_event_availability(event_id, requested_seats):
    """Check if event has enough available seats"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    e.max_attendees,
                    COALESCE(SUM(er.number_of_seats), 0) as total_registered
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.id = %s
                GROUP BY e.id, e.max_attendees;
            """, [event_id])
            
            result = cursor.fetchone()
            if not result:
                return False, "Event not found"
                
            max_attendees, total_registered = result
            
            if max_attendees and (total_registered + requested_seats > max_attendees):
                return False, f"Only {max_attendees - total_registered} seats available"
                
            return True, "Seats available"
            
    except Exception as e:
        print(f"Error checking availability: {str(e)}")
        return False, str(e)

def register_for_event(event_id, user_id, registration_data):
    """Register a user for an event"""
    try:
        with connection.cursor() as cursor:
            # Check if user is already registered
            cursor.execute("""
                SELECT id FROM event_registrations 
                WHERE event_id = %s AND attendee_id = %s;
            """, [event_id, user_id])
            
            if cursor.fetchone():
                return None, "You are already registered for this event"
            
            # Check if user is an organizer
            cursor.execute("""
                SELECT user_type FROM users 
                WHERE id = %s;
            """, [user_id])
            
            user_type = cursor.fetchone()[0]
            if user_type == 'organizer':
                return None, "Organizers cannot register for events"
            
            # Check if user is the event owner
            cursor.execute("""
                SELECT organizer_id FROM events 
                WHERE id = %s;
            """, [event_id])
            
            event_owner = cursor.fetchone()[0]
            if str(event_owner) == str(user_id):
                return None, "Event owners cannot register for their own events"
            
            # Get event details and user details
            cursor.execute("""
                SELECT 
                    e.title, e.ticket_price, e.max_attendees, e.venue, e.address, 
                    e.event_date, e.event_time, u.email, u.username
                FROM events e
                JOIN users u ON u.id = %s
                WHERE e.id = %s;
            """, [user_id, event_id])
            
            event = cursor.fetchone()
            if not event:
                return None, "Event not found"
                
            (title, ticket_price, max_attendees, venue, address, event_date, event_time, 
             email, username) = event
            
            # Get requested seats from registration data
            requested_seats = registration_data.get('number_of_seats', 1)
            if not isinstance(requested_seats, int) or requested_seats < 1:
                return None, "Invalid number of seats"
            
            # Check event availability
            is_available, message = check_event_availability(event_id, requested_seats)
            if not is_available:
                return None, message
            
            # Calculate total amount
            total_amount = ticket_price * requested_seats
            
            # Create registration with UUID
            registration_id = str(uuid.uuid4())
            
            # Generate QR code with registration details
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=4,
            )
            qr_data = f"{registration_id}"
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create QR code image
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_buffer = io.BytesIO()
            qr_img.save(qr_buffer, format='PNG')
            qr_buffer.seek(0)
            qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode()
            qr_data_uri = f"data:image/png;base64,{qr_base64}"
            
            # Insert registration with all fields
            cursor.execute("""
                INSERT INTO event_registrations (
                    id, event_id, attendee_id, number_of_seats,
                    total_amount, qr_code, status, dietary_requirements,
                    t_shirt_size, additional_info, registration_date
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, 'approved', %s, %s, %s, NOW()
                ) RETURNING id;
            """, [
                registration_id, event_id, user_id, requested_seats,
                total_amount, qr_data_uri,
                registration_data.get('dietary_requirements'),
                registration_data.get('t_shirt_size'),
                registration_data.get('additional_info')
            ])
            
            # Prepare data for ticket generation
            ticket_data = {
                'id': registration_id,
                'title': title,
                'event_date': event_date.strftime('%Y-%m-%d'),
                'event_time': event_time.strftime('%H:%M:%S'),
                'venue': venue,
                'address': address,
                'number_of_seats': requested_seats,
                'total_amount': total_amount,
                'qr_code': qr_data_uri,
                'registration_date': datetime.now().strftime('%Y-%m-%d'),
                'attendee_name': username,
                'attendee_email': email,
                'dietary_requirements': registration_data.get('dietary_requirements', ''),
                't_shirt_size': registration_data.get('t_shirt_size', '')
            }
            
            # Generate PDF ticket
            from .ticket_generator import generate_ticket_pdf
            pdf_content = generate_ticket_pdf(ticket_data)
            
            # Convert PDF to base64
            pdf_base64 = base64.b64encode(pdf_content).decode()
            pdf_data_uri = f"data:application/pdf;base64,{pdf_base64}"
            
            # Update registration with PDF ticket
            cursor.execute("""
                UPDATE event_registrations
                SET ticket_pdf = %s
                WHERE id = %s;
            """, [pdf_data_uri, registration_id])
            
            return registration_id, "Registration successful"
            
    except Exception as e:
        print(f"Error registering for event: {str(e)}")
        return None, str(e)

def get_registration_details(registration_id):
    """Get detailed information about a registration"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    er.id, er.number_of_seats, er.total_amount,
                    er.registration_date, er.qr_code,
                    e.title, e.event_date, e.event_time,
                    e.venue, e.address,
                    u.username, u.email
                FROM event_registrations er
                JOIN events e ON er.event_id = e.id
                JOIN users u ON er.attendee_id = u.id
                WHERE er.id = %s;
            """, [registration_id])
            
            result = cursor.fetchone()
            if result:
                return {
                    'id': str(result[0]),  # Convert UUID to string
                    'number_of_seats': result[1],
                    'total_amount': float(result[2]),
                    'registration_date': result[3].strftime('%Y-%m-%d'),
                    'qr_code': result[4],
                    'title': result[5],
                    'event_date': result[6].strftime('%Y-%m-%d'),
                    'event_time': result[7].strftime('%H:%M:%S'),
                    'venue': result[8],
                    'address': result[9],
                    'username': result[10],
                    'email': result[11]
                }
            return None
            
    except Exception as e:
        print(f"Error getting registration details: {str(e)}")
        return None

def get_event_registrations(event_id, organizer_id):
    """Get list of all registrations for an event, only if the organizer owns the event"""
    try:
        with connection.cursor() as cursor:
            # First verify if the organizer owns this event
            cursor.execute("""
                SELECT id FROM events 
                WHERE id = %s AND organizer_id = %s;
            """, [event_id, organizer_id])
            
            if not cursor.fetchone():
                return False, "You don't have permission to view these registrations"

            # Get all registrations with user details
            cursor.execute("""
                SELECT 
                    er.id, er.number_of_seats, er.total_amount,
                    er.dietary_requirements, er.t_shirt_size,
                    er.registration_date, er.status,
                    u.username, u.email
                FROM event_registrations er
                JOIN users u ON er.attendee_id = u.id
                WHERE er.event_id = %s
                ORDER BY er.registration_date DESC;
            """, [event_id])
            
            registrations = []
            for row in cursor.fetchall():
                registrations.append({
                    'registration_id': row[0],
                    'registration_info': {
                        'number_of_seats': row[1],
                        'total_amount': float(row[2]),
                        'dietary_requirements': row[3],
                        't_shirt_size': row[4],
                        'registration_date': row[5],
                        'status': row[6]
                    },
                    'attendee': {
                        'username': row[7],
                        'email': row[8]
                    }
                })
            
            # Get event summary
            cursor.execute("""
                SELECT 
                    COUNT(er.id) as total_registrations,
                    SUM(er.number_of_seats) as total_seats,
                    SUM(er.total_amount) as total_amount
                FROM event_registrations er
                WHERE er.event_id = %s;
            """, [event_id])
            
            summary = cursor.fetchone()
            
            return True, {
                'registrations': registrations,
                'summary': {
                    'total_registrations': summary[0],
                    'total_seats': summary[1] or 0,
                    'total_amount': float(summary[2] or 0)
                }
            }
            
    except Exception as e:
        print(f"Error getting event registrations: {str(e)}")
        return False, str(e)

def get_organizer_events_with_registrations(organizer_id):
    """Get all events of an organizer with their registration summaries"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH registration_stats AS (
                    SELECT 
                        er.event_id,
                        COUNT(*) as total_registrations,
                        COUNT(CASE WHEN er.status = 'approved' THEN 1 END) as approved_registrations,
                        COUNT(CASE WHEN er.status = 'pending' THEN 1 END) as pending_registrations,
                        COUNT(CASE WHEN er.status = 'rejected' THEN 1 END) as rejected_registrations,
                        SUM(er.total_amount) as total_revenue
                    FROM event_registrations er
                    GROUP BY er.event_id
                )
                SELECT 
                    e.id, e.title, e.description, e.category,
                    e.event_type, e.venue, e.address,
                    e.event_date, e.event_time, e.ticket_price,
                    e.max_attendees, e.image_url, e.status,
                    e.publication_status, e.slug,
                    e.created_at, e.updated_at,
                    COALESCE(rs.total_registrations, 0) as total_registrations,
                    COALESCE(rs.approved_registrations, 0) as approved_registrations,
                    COALESCE(rs.pending_registrations, 0) as pending_registrations,
                    COALESCE(rs.rejected_registrations, 0) as rejected_registrations,
                    COALESCE(rs.total_revenue, 0) as total_revenue
                FROM events e
                LEFT JOIN registration_stats rs ON e.id = rs.event_id
                WHERE e.organizer_id = %s
                ORDER BY e.created_at DESC;
            """, [organizer_id])
            
            events = []
            for row in cursor.fetchall():
                events.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'category': row[3],
                    'event_type': row[4],
                    'venue': row[5],
                    'address': row[6],
                    'event_date': row[7],
                    'event_time': row[8],
                    'ticket_price': float(row[9]),
                    'max_attendees': row[10],
                    'image_url': row[11],
                    'status': row[12],
                    'publication_status': row[13],
                    'slug': row[14],
                    'created_at': row[15],
                    'updated_at': row[16],
                    'registration_summary': {
                        'total_registrations': row[17],
                        'approved_registrations': row[18],
                        'pending_registrations': row[19],
                        'rejected_registrations': row[20],
                        'total_revenue': float(row[21])
                    }
                })
            return True, events
    except Exception as e:
        logger.error(f"Error getting organizer events: {str(e)}")
        return False, str(e)

def get_event_by_slug(slug):
    """Get detailed event information by slug"""
    try:
        print(f"[DB] Fetching event with slug: {slug}")
        with connection.cursor() as cursor:
            query = """
                SELECT 
                    e.id,
                    e.title,
                    e.description,
                    e.category,
                    e.event_type,
                    e.venue,
                    e.address,
                    e.event_date,
                    e.event_time,
                    e.ticket_price,
                    e.max_attendees,
                    e.image_url,
                    e.status,
                    e.publication_status,
                    e.slug,
                    e.created_at,
                    e.updated_at,
                    COUNT(DISTINCT er.id) as total_registrations,
                    u.id as user_id,
                    u.email,
                    op.organization_name,
                    op.profile_picture_url,
                    op.facebook_url,
                    op.description as org_description,
                    op.website_url,
                    op.phone,
                    op.organization_category
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                LEFT JOIN users u ON e.organizer_id = u.id
                LEFT JOIN organizer_profiles op ON u.id = op.user_id
                WHERE e.slug = %s AND e.publication_status = 'published'
                GROUP BY 
                    e.id,
                    e.title,
                    e.description,
                    e.category,
                    e.event_type,
                    e.venue,
                    e.address,
                    e.event_date,
                    e.event_time,
                    e.ticket_price,
                    e.max_attendees,
                    e.image_url,
                    e.status,
                    e.publication_status,
                    e.slug,
                    e.created_at,
                    e.updated_at,
                    u.id,
                    u.email,
                    op.organization_name,
                    op.profile_picture_url,
                    op.facebook_url,
                    op.description,
                    op.website_url,
                    op.phone,
                    op.organization_category;
            """
            
            print(f"[DB] Executing query with slug: {slug}")
            cursor.execute(query, [slug])
            
            result = cursor.fetchone()
            if result:
                print(f"[DB] Found event with title: {result[1]}")
                event_dict = {
                    'id': str(result[0]),
                    'title': result[1],
                    'description': result[2],
                    'category': result[3],
                    'eventType': result[4],
                    'venue': result[5],
                    'address': result[6],
                    'eventDate': result[7].strftime('%Y-%m-%d') if result[7] else None,
                    'eventTime': result[8].strftime('%H:%M') if result[8] else None,
                    'ticketPrice': float(result[9]) if result[9] is not None else 0.0,
                    'maxAttendees': result[10],
                    'imageUrl': result[11],
                    'status': result[12],
                    'publicationStatus': result[13],
                    'slug': result[14],
                    'createdAt': result[15].isoformat() if result[15] else None,
                    'updatedAt': result[16].isoformat() if result[16] else None,
                    'registrationStats': {
                        'totalRegistrations': result[17]
                    },
                    'organizer': {
                        'id': str(result[18]) if result[18] else None,
                        'email': result[19],
                        'organizationName': result[20],
                        'profilePictureUrl': result[21],
                        'facebookUrl': result[22],
                        'description': result[23],
                        'websiteUrl': result[24],
                        'phone': result[25],
                        'organizationCategory': result[26]
                    } if result[18] else None
                }
                print(f"[DB] Successfully created event dictionary")
                return event_dict
            print("[DB] No event found")
            return None
            
    except Exception as e:
        print(f"[DB] Error getting event by slug: {str(e)}")
        print(f"[DB] SQL Query was: {query}")
        raise e

def update_event_by_slug(slug, organizer_id, event_data):
    """Update an event by slug"""
    try:
        # First check if the event exists and belongs to the organizer
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id FROM events
                WHERE slug = %s AND organizer_id = %s;
            """, [slug, organizer_id])
            result = cursor.fetchone()
            if not result:
                return False, "Event not found or you don't have permission to update it"
            
            event_id = result[0]

            # Build the update query dynamically based on provided fields
            update_fields = []
            params = []
            if 'title' in event_data:
                update_fields.append("title = %s")
                params.append(event_data['title'])
            if 'description' in event_data:
                update_fields.append("description = %s")
                params.append(event_data['description'])
            if 'category' in event_data:
                update_fields.append("category = %s")
                params.append(event_data['category'])
            if 'event_type' in event_data:
                update_fields.append("event_type = %s")
                params.append(event_data['event_type'])
            if 'venue' in event_data:
                update_fields.append("venue = %s")
                params.append(event_data['venue'])
            if 'address' in event_data:
                update_fields.append("address = %s")
                params.append(event_data['address'])
            if 'event_date' in event_data:
                update_fields.append("event_date = %s")
                params.append(event_data['event_date'])
            if 'event_time' in event_data:
                update_fields.append("event_time = %s")
                params.append(event_data['event_time'])
            if 'ticket_price' in event_data:
                update_fields.append("ticket_price = %s")
                params.append(event_data['ticket_price'])
            if 'max_attendees' in event_data:
                update_fields.append("max_attendees = %s")
                params.append(event_data['max_attendees'])
            if 'image_url' in event_data:
                update_fields.append("image_url = %s")
                params.append(event_data['image_url'])
            if 'publication_status' in event_data:
                update_fields.append("publication_status = %s")
                params.append(event_data['publication_status'])
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            
            if not update_fields:
                return False, "No fields to update"
            
            # Add event_id to params for WHERE clause
            params.append(event_id)
            
            query = f"""
                UPDATE events 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id;
            """
            
            cursor.execute(query, params)
            connection.commit()
            
            if cursor.rowcount > 0:
                return True, "Event updated successfully"
            return False, "Failed to update event"
            
    except Exception as e:
        logger.error(f"Error updating event: {str(e)}")
        return False, str(e)

def get_upcoming_events():
    """Get all upcoming events ordered by created date (most recent first)"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    e.id, e.title, e.description, e.organizer_id, 
                    e.category, e.event_type, e.venue, e.address,
                    e.event_date, e.event_time, e.ticket_price,
                    e.max_attendees, e.image_url, e.status,
                    e.publication_status, e.slug,
                    e.created_at, e.updated_at,
                    u.username as organizer_name,
                    COUNT(er.id) as registered_attendees
                FROM events e
                LEFT JOIN users u ON e.organizer_id = u.id
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.event_date >= CURRENT_DATE 
                AND e.publication_status = 'published'
                GROUP BY e.id, u.username
                ORDER BY e.created_at DESC;
            """)
            
            events = []
            for row in cursor.fetchall():
                event = {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'organizer_id': row[3],
                    'category': row[4],
                    'event_type': row[5],
                    'venue': row[6],
                    'address': row[7],
                    'event_date': row[8],
                    'event_time': str(row[9]) if row[9] else None,
                    'ticket_price': float(row[10]) if row[10] is not None else 0.0,
                    'max_attendees': row[11],
                    'image_url': row[12],
                    'status': row[13],
                    'publication_status': row[14],
                    'slug': row[15],
                    'created_at': row[16].isoformat() if row[16] else None,
                    'updated_at': row[17].isoformat() if row[17] else None,
                    'organizer_name': row[18],
                    'registered_attendees': row[19]
                }
                events.append(event)
            return events
            
    except Exception as e:
        logger.error(f"Error getting upcoming events: {str(e)}")
        return []

def get_user_registered_events(user_id):
    """Get all events registered by a user"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    er.id as registration_id,
                    e.id as event_id,
                    e.title,
                    e.event_date,
                    e.event_time,
                    e.venue,
                    e.address,
                    er.number_of_seats,
                    er.total_amount,
                    er.registration_date,
                    er.qr_code,
                    er.ticket_pdf,
                    er.status,
                    org.username as organizer_name
                FROM event_registrations er
                JOIN events e ON er.event_id = e.id
                JOIN users org ON e.organizer_id = org.id
                WHERE er.attendee_id = %s
                ORDER BY er.registration_date DESC;
            """, [user_id])
            
            registrations = []
            for row in cursor.fetchall():
                registrations.append({
                    'registration_id': row[0],
                    'event_id': row[1],
                    'title': row[2],
                    'event_date': row[3].strftime('%Y-%m-%d') if row[3] else None,
                    'event_time': row[4].strftime('%H:%M:%S') if row[4] else None,
                    'venue': row[5],
                    'address': row[6],
                    'number_of_seats': row[7],
                    'total_amount': float(row[8]) if row[8] else 0.0,
                    'registration_date': row[9].strftime('%Y-%m-%d %H:%M:%S') if row[9] else None,
                    'qr_code': row[10],
                    'ticket_pdf': row[11],
                    'status': row[12],
                    'organizer_name': row[13]
                })
            
            return registrations
            
    except Exception as e:
        print(f"Error getting user registered events: {str(e)}")
        return None

def get_event_participants(event_id, organizer_id):
    """Get list of all participants for an event, only if the organizer owns the event"""
    try:
        with connection.cursor() as cursor:
            # First verify if the organizer owns this event and get event details
            cursor.execute("""
                SELECT id, max_attendees FROM events 
                WHERE id = %s AND organizer_id = %s;
            """, [event_id, organizer_id])
            
            event = cursor.fetchone()
            if not event:
                return False, "Unauthorized: You are not the organizer of this event"
            
            event_max_attendees = event[1]
            
            # Get total seats booked
            cursor.execute("""
                SELECT COALESCE(SUM(number_of_seats), 0)
                FROM event_registrations
                WHERE event_id = %s;
            """, [event_id])
            
            total_seats_booked = cursor.fetchone()[0]
            
            # Get all participants with their details and check-in status
            cursor.execute("""
                SELECT 
                    er.id as registration_id,
                    er.number_of_seats,
                    er.total_amount,
                    er.registration_date,
                    er.check_in_status,
                    er.check_in_time,
                    u.username,
                    u.email
                FROM event_registrations er
                JOIN users u ON er.attendee_id = u.id
                WHERE er.event_id = %s
                ORDER BY er.registration_date DESC;
            """, [event_id])
            
            columns = [col[0] for col in cursor.description]
            participants = []
            
            for row in cursor.fetchall():
                participant = dict(zip(columns, row))
                # Convert dates to string format
                participant['registration_date'] = participant['registration_date'].isoformat() if participant['registration_date'] else None
                participant['check_in_time'] = participant['check_in_time'].isoformat() if participant['check_in_time'] else None
                participants.append(participant)
            
            return True, {
                'participants': participants,
                'total_seats_booked': total_seats_booked,
                'max_attendees': event_max_attendees,
                'available_seats': event_max_attendees - total_seats_booked if event_max_attendees else None,
                'registrations_count': len(participants)
            }
            
    except Exception as e:
        print(f"Error getting event participants: {str(e)}")
        return False, f"Error getting event participants: {str(e)}"

def process_check_in(registration_id, organizer_id):
    """Process check-in for an event registration"""
    try:
        with connection.cursor() as cursor:
            # First verify if the organizer owns this event
            cursor.execute("""
                SELECT e.organizer_id, er.check_in_status
                FROM event_registrations er
                JOIN events e ON er.event_id = e.id
                WHERE er.id = %s;
            """, [registration_id])
            
            result = cursor.fetchone()
            if not result:
                return False, "Registration not found"
                
            event_organizer_id, check_in_status = result
            
            # Verify organizer
            if str(event_organizer_id) != str(organizer_id):
                return False, "Unauthorized: You are not the organizer of this event"
                
            # Check if already checked in
            if check_in_status:
                return False, "Already checked in"
                
            # Process check-in
            cursor.execute("""
                UPDATE event_registrations
                SET check_in_status = TRUE,
                    check_in_time = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id;
            """, [registration_id])
            
            if cursor.fetchone():
                return True, "Check-in successful"
            return False, "Check-in failed"
            
    except Exception as e:
        print(f"Error processing check-in: {str(e)}")
        return False, f"Error processing check-in: {str(e)}"

def get_organizer_dashboard(organizer_id):
    """Get dashboard statistics for an organizer"""
    try:
        with connection.cursor() as cursor:
            # Get total events count
            cursor.execute("""
                SELECT COUNT(*)
                FROM events
                WHERE organizer_id = %s;
            """, [organizer_id])
            total_events = cursor.fetchone()[0]
            
            # Get active events (event_date >= current_date)
            cursor.execute("""
                SELECT COUNT(*)
                FROM events
                WHERE organizer_id = %s
                AND event_date >= CURRENT_DATE;
            """, [organizer_id])
            active_events = cursor.fetchone()[0]
            
            # Get total participants and revenue
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(er.number_of_seats), 0) as total_participants,
                    COALESCE(SUM(er.total_amount), 0) as total_revenue,
                    COUNT(DISTINCT er.id) as total_registrations,
                    COUNT(DISTINCT CASE WHEN er.check_in_status = TRUE THEN er.id END) as total_checked_in
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.organizer_id = %s;
            """, [organizer_id])
            
            stats = cursor.fetchone()
            total_participants = stats[0]
            total_revenue = stats[1]
            total_registrations = stats[2]
            total_checked_in = stats[3]
            
            # Get upcoming events
            cursor.execute("""
                SELECT 
                    id,
                    title,
                    event_date,
                    event_time,
                    venue,
                    max_attendees,
                    image_url,
                    slug,
                    (
                        SELECT COALESCE(SUM(number_of_seats), 0)
                        FROM event_registrations
                        WHERE event_id = events.id
                    ) as booked_seats
                FROM events
                WHERE organizer_id = %s
                AND event_date >= CURRENT_DATE
                ORDER BY event_date ASC, event_time ASC
                LIMIT 5;
            """, [organizer_id])
            
            columns = [col[0] for col in cursor.description]
            upcoming_events = []
            for row in cursor.fetchall():
                event = dict(zip(columns, row))
                # Combine event_date and event_time for full datetime
                if event['event_date'] and event['event_time']:
                    event_datetime = datetime.combine(event['event_date'], event['event_time'])
                    event['event_datetime'] = event_datetime.isoformat()
                event['event_date'] = event['event_date'].isoformat() if event['event_date'] else None
                event['event_time'] = event['event_time'].isoformat() if event['event_time'] else None
                upcoming_events.append(event)
            
            # Get recent registrations
            cursor.execute("""
                SELECT 
                    er.id as registration_id,
                    e.title as event_title,
                    er.registration_date,
                    er.number_of_seats,
                    er.total_amount,
                    u.username,
                    u.email
                FROM event_registrations er
                JOIN events e ON er.event_id = e.id
                JOIN users u ON er.attendee_id = u.id
                WHERE e.organizer_id = %s
                ORDER BY er.registration_date DESC
                LIMIT 5;
            """, [organizer_id])
            
            columns = [col[0] for col in cursor.description]
            recent_registrations = []
            for row in cursor.fetchall():
                registration = dict(zip(columns, row))
                registration['registration_date'] = registration['registration_date'].isoformat() if registration['registration_date'] else None
                recent_registrations.append(registration)
            
            return True, {
                'total_events': total_events,
                'active_events': active_events,
                'total_participants': total_participants,
                'total_revenue': float(total_revenue),
                'total_registrations': total_registrations,
                'total_checked_in': total_checked_in,
                'upcoming_events': upcoming_events,
                'recent_registrations': recent_registrations
            }
            
    except Exception as e:
        print(f"Error getting organizer dashboard: {str(e)}")
        return False, f"Error getting organizer dashboard: {str(e)}"

def get_user_event_statistics(user_id):
    """Get event statistics for a user"""
    print(f"DB: Getting event statistics for user {user_id}")
    
    try:
        with connection.cursor() as cursor:
            # Get upcoming events count
            query = """
                SELECT COUNT(*)
                FROM event_registrations r
                INNER JOIN events e ON r.event_id = e.id
                WHERE r.attendee_id = %s AND e.event_date >= CURRENT_DATE;
            """
            cursor.execute(query, [user_id])
            upcoming_events = cursor.fetchone()[0]
            
            # Get past events count
            query = """
                SELECT COUNT(*)
                FROM event_registrations r
                INNER JOIN events e ON r.event_id = e.id
                WHERE r.attendee_id = %s AND e.event_date < CURRENT_DATE;
            """
            cursor.execute(query, [user_id])
            past_events = cursor.fetchone()[0]
            
            # Get total amount spent
            query = """
                SELECT COALESCE(SUM(total_amount), 0)
                FROM event_registrations
                WHERE attendee_id = %s;
            """
            cursor.execute(query, [user_id])
            total_spent = cursor.fetchone()[0]
            
            return {
                'upcoming_events': upcoming_events,
                'past_events': past_events,
                'total_spent': float(total_spent)
            }
            
    except Exception as e:
        print(f"DB Error: {str(e)}")
        return None