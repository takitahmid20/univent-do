from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Import signals
        import accounts.signals

        # Import and run database setup
        from accounts.db_manager import setup_database, update_schema
        
        logger.info("Setting up database tables...")
        if setup_database():
            logger.info("✅ Database tables created successfully")
        else:
            logger.error("❌ Error creating database tables")

        logger.info("Updating schema if needed...")
        if update_schema():
            logger.info("✅ Schema updated successfully")
        else:
            logger.error("❌ Error updating schema")
