import os
import django
import json
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Profile, UserProfile, Organization
from events.models import Event, Registration

User = get_user_model()

def create_organizer(number):
    try:
        organizer = User.objects.get(email=f'organizer{number}@test.com')
        print(f"Using existing organizer {number}")
    except User.DoesNotExist:
        organizer = User.objects.create_user(
            username=f'organizer{number}',
            email=f'organizer{number}@test.com',
            password='Test@123456'
        )
        print(f"Created new organizer {number}")
    
    organizer_profile, _ = Profile.objects.get_or_create(
        user=organizer,
        defaults={'user_type': 'organizer'}
    )
    
    organizer_userprofile, _ = UserProfile.objects.get_or_create(
        user=organizer,
        defaults={
            'name': f'Test Organizer {number}',
            'university': f'University {number}',
            'department': 'Computer Science',
            'student_id': f'ORG{number}123'
        }
    )
    
    organization, _ = Organization.objects.get_or_create(
        user=organizer,
        defaults={
            'name': f'Organization {number}',
            'email': f'org{number}@test.com',
            'mobile_number': f'+1234567{number:03d}',
            'website': f'https://org{number}.com',
            'category': ['Technology', 'Education', 'Entertainment', 'Business'][number % 4]
        }
    )
    
    return organizer_profile, organization

def create_attendee(number):
    try:
        attendee = User.objects.get(email=f'attendee{number}@test.com')
        print(f"Using existing attendee {number}")
    except User.DoesNotExist:
        attendee = User.objects.create_user(
            username=f'attendee{number}',
            email=f'attendee{number}@test.com',
            password='Test@123456'
        )
        print(f"Created new attendee {number}")
    
    attendee_profile, _ = Profile.objects.get_or_create(
        user=attendee,
        defaults={'user_type': 'attendee'}
    )
    
    attendee_userprofile, _ = UserProfile.objects.get_or_create(
        user=attendee,
        defaults={
            'name': f'Test Attendee {number}',
            'university': f'University {number}',
            'department': ['Computer Science', 'Business', 'Engineering', 'Arts'][number % 4],
            'student_id': f'ATT{number}123'
        }
    )
    
    return attendee

def create_event(number, organizer_profile, organization):
    event_types = ['Conference', 'Workshop', 'Seminar', 'Hackathon']
    locations = ['Tech Hub', 'University Center', 'Innovation Lab', 'Convention Center']
    
    event, created = Event.objects.get_or_create(
        title=f'Event {number}: {event_types[number % 4]}',
        defaults={
            'organizer': organizer_profile,
            'description': f'A great {event_types[number % 4]} for everyone interested in {["technology", "education", "entertainment", "business"][number % 4]}',
            'category': ['Technology', 'Education', 'Entertainment', 'Business'][number % 4],
            'date': datetime.now().date() + timedelta(days=30 + number),
            'time': datetime.now().time(),
            'location': locations[number % 4],
            'address': f'Building {number}, {locations[number % 4]}, City',
            'ticket_price': float(number * 10),
            'max_attendees': 50 + (number * 10),
            'organization': organization,
            'status': 'published'
        }
    )
    
    if created:
        print(f"Created new event: {event.title}")
    
    return event

def create_test_data():
    print("\nCreating Organizers...")
    organizers = [create_organizer(i) for i in range(1, 5)]  # Create 4 organizers
    
    print("\nCreating Attendees...")
    attendees = [create_attendee(i) for i in range(1, 11)]  # Create 10 attendees
    
    print("\nCreating Events...")
    events = []
    for i in range(1, 9):  # Create 8 events
        organizer_profile, organization = organizers[(i-1) % 4]  # Cycle through organizers
        event = create_event(i, organizer_profile, organization)
        events.append(event)
    
    print("\nCreating Event Registrations...")
    # Register attendees for random events
    for i, attendee in enumerate(attendees):
        # Each attendee registers for 2-3 events
        for event in events[i % 4:(i % 4) + 3]:
            registration, created = Registration.objects.get_or_create(
                event=event,
                user=attendee,
                defaults={
                    'university_name': f'University {i+1}',
                    'number_of_seats': 1 + (i % 3),
                    'address': f'Address {i+1}',
                    'emergency_mobile_number': f'+1234567{i:03d}'
                }
            )
            if created:
                print(f"Registered {attendee.email} for {event.title}")
    
    print("\nTest data setup completed!")
    print("\nSample Login Credentials:")
    print("\nOrganizers:")
    for i in range(1, 5):
        print(f"\nOrganizer {i}:")
        print(f"Email: organizer{i}@test.com")
        print("Password: Test@123456")
    
    print("\nAttendees:")
    for i in range(1, 11):
        print(f"\nAttendee {i}:")
        print(f"Email: attendee{i}@test.com")
        print("Password: Test@123456")

if __name__ == '__main__':
    create_test_data()
