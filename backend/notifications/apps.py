from django.apps import AppConfig
from django.db import connection

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'

    def ready(self):
        """Set up notifications app when Django starts"""
        print("Notifications app is ready, setting up database...")
        try:
            from .db_manager import setup_database
            setup_database()
        except Exception as e:
            print(f"Error setting up notifications database: {str(e)}")
