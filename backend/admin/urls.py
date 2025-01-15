from django.urls import path
from .views import AdminLoginView, ListAttendeesView, ListOrganizersView, DeleteAttendeeView, DeleteOrganizerView

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('attendees/', ListAttendeesView.as_view(), name='list-attendees'),
    path('organizers/', ListOrganizersView.as_view(), name='list-organizers'),
    path('attendees/<uuid:user_id>/', DeleteAttendeeView.as_view(), name='delete-attendee'),
    path('organizers/<uuid:user_id>/', DeleteOrganizerView.as_view(), name='delete-organizer'),
]
