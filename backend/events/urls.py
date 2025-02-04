from django.urls import path
from .views import (
    CreateEventView, OrganizerEventsView, UpdateEventView, 
    DeleteEventView, EventRegistrationView, RegistrationDetailsView,
    OrganizerEventsListView, EventRegistrationsListView, PublicEventsView,
    ImageUploadView, GetEventByIDView, UserRegisteredEventsView, SimpleCheckInView,
    QRCheckInView, EventParticipantsView, OrganizerDashboardView, UserDashboardView,
    download_ticket, PublicEventDetailView, ToggleCheckInView, CheckRegistrationView
)

urlpatterns = [
    path('', PublicEventsView.as_view(), name='public_events'),  
    path('create/', CreateEventView.as_view(), name='create_event'),
    path('organizer/', OrganizerEventsView.as_view(), name='organizer_events'),
    path('get/<uuid:event_id>/', GetEventByIDView.as_view(), name='get_event_by_id'),
    # path('get/slug/<str:slug>/', GetEventBySlugView.as_view(), name='get_event_by_slug'),
    path('update/<uuid:event_id>/', UpdateEventView.as_view(), name='update_event'),
    path('delete/<uuid:event_id>/', DeleteEventView.as_view(), name='delete_event'),
    path('register/<uuid:event_id>/', EventRegistrationView.as_view(), name='register_event'),
    path('registration/<uuid:registration_id>/', RegistrationDetailsView.as_view(), name='registration_details'),
    path('organizer/events/', OrganizerEventsListView.as_view(), name='organizer-events-list'),
    path('registrations/<uuid:event_id>/', EventRegistrationsListView.as_view(), name='event-registrations'),
    path('upload/', ImageUploadView.as_view(), name='image_upload'),
    path('my-registrations/', UserRegisteredEventsView.as_view(), name='user-registered-events'),
    path('check-in/simple/', SimpleCheckInView.as_view(), name='simple-check-in'),
    path('check-in/qr/', QRCheckInView.as_view(), name='qr-check-in'),
    path('check-in/toggle/<uuid:registration_id>/', ToggleCheckInView.as_view(), name='toggle-check-in'),
    path('participants/<uuid:event_id>/', EventParticipantsView.as_view(), name='event-participants'),
    path('organizer/dashboard/', OrganizerDashboardView.as_view(), name='organizer-dashboard'),
    path('user/dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    path('registrations/<uuid:registration_id>/ticket/', download_ticket, name='download_ticket'),
    path('public/<str:slug>/', PublicEventDetailView.as_view(), name='public-event-detail'),
    path('check-registration/<uuid:event_id>/', CheckRegistrationView.as_view(), name='check-registration'),
]
#ggg
