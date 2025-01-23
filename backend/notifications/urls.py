from django.urls import path
from .views import (
    NotificationsView, NotificationReadView, UnreadCountView,
    EventNotificationView
)

urlpatterns = [
    path('', NotificationsView.as_view(), name='notifications'),
    path('read/<uuid:notification_id>/', NotificationReadView.as_view(), name='mark-notification-read'),
    path('unread-count/', UnreadCountView.as_view(), name='unread-count'),
    path('event/<uuid:event_id>/', EventNotificationView.as_view(), name='event-notification'),
    path('event/<uuid:event_id>/list/', NotificationsView.as_view(), name='event-notifications-list'),
]
