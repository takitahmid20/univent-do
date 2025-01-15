# accounts/urls.py
from django.urls import path
from .views import (
    SignUpView, LoginView, AttendeeProfileView, OrganizerProfileView,
    UpdateEmailView, VerifyEmailView, ResendVerificationView, PublicOrganizersListView,
    OrganizerDetailView, OrganizerSlugView, CheckSlugAvailabilityView
)

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    # path('logout/', LogoutView.as_view(), name='logout'),
    path('attendee/profile/', AttendeeProfileView.as_view(), name='attendee-profile'),
    path('organizer/profile/', OrganizerProfileView.as_view(), name='organizer-profile'),
    path('attendee/profile/email/', UpdateEmailView.as_view(), name='update-email'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('organizers/', PublicOrganizersListView.as_view(), name='public-organizers-list'),
    path('organizers/<str:slug>/', OrganizerDetailView.as_view(), name='organizer-detail'),
    path('organizer/slug/', OrganizerSlugView.as_view(), name='organizer-slug'),
    path('organizer/check-slug/', CheckSlugAvailabilityView.as_view(), name='check-slug'),
]
