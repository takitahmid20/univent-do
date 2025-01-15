from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class EventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'events'

    def ready(self):
        print("Events app is ready, setting up database...")
        from .db_manager import setup_database
        
        if setup_database():
            print("✅ Events database tables created successfully")
        else:
            print("❌ Error creating events database tables")
