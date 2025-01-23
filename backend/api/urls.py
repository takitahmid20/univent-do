# myproject/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

"""api URL Configuration"""
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/events/', include('events.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/admin/', include('admin.urls')),  # Add admin app URLs
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
