from django.db import connection
import logging

logger = logging.getLogger(__name__)

def setup_database():
    """Setup or update database tables"""
    with connection.cursor() as cursor:
        try:
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    user_type VARCHAR(60) NOT NULL CHECK (user_type IN ('attendee', 'organizer')),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;""")

            # Create attendee_profiles table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS attendee_profiles (
                    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                    full_name VARCHAR(255),
                    phone VARCHAR(20),
                    university VARCHAR(255),
                    department VARCHAR(255),
                    location VARCHAR(255),
                    profile_picture_url TEXT,
                    joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Create organizer_profiles table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS organizer_profiles (
                    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                    organization_name VARCHAR(255),
                    phone VARCHAR(20),
                    website_url TEXT,
                    facebook_url TEXT,
                    organization_category VARCHAR(100),
                    description TEXT,
                    profile_picture_url TEXT,
                    joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    slug VARCHAR(255) UNIQUE
                )
            """)

            # Add slug column if it doesn't exist
            cursor.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'organizer_profiles' 
                        AND column_name = 'slug'
                    ) THEN
                        ALTER TABLE organizer_profiles ADD COLUMN slug VARCHAR(255) UNIQUE;
                        
                        -- Generate default slugs for existing organizers
                        WITH organizer_usernames AS (
                            SELECT op.user_id, u.username
                            FROM organizer_profiles op
                            JOIN users u ON op.user_id = u.id
                            WHERE op.slug IS NULL
                        )
                        UPDATE organizer_profiles op
                        SET slug = LOWER(REGEXP_REPLACE(u.username, '[^a-zA-Z0-9]+', '-', 'g'))
                        FROM organizer_usernames u
                        WHERE op.user_id = u.user_id;
                    END IF;
                END $$;
            """)

            # Create invalid_tokens table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS invalid_tokens (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    token TEXT NOT NULL,
                    invalidated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    UNIQUE(token)
                )
            """)
            # Create email_verification_tokens table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS verification_codes (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    code VARCHAR(6) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP WITH TIME ZONE,
                    is_used BOOLEAN DEFAULT FALSE
                )
            """)


            logger.info("Database setup completed successfully")
            return True

        except Exception as e:
            logger.error(f"Error setting up database: {str(e)}")
            return False


def update_schema():
    """Update database schema if needed"""
    with connection.cursor() as cursor:
        try:
            # Check current column type and length
            cursor.execute("""
                SELECT column_name, data_type, character_maximum_length
                FROM information_schema.columns
                WHERE table_name = 'users'
                AND column_name = 'user_type';
            """)
            before_update = cursor.fetchone()
            logger.info(f"Before update - Column details: {before_update}")

            # Modify user_type column if needed
            cursor.execute("""
                DO $$ 
                BEGIN 
                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_name = 'users' 
                        AND column_name = 'user_type' 
                        AND (
                            data_type != 'character varying' 
                            OR character_maximum_length != 60
                        )
                    ) THEN 
                        ALTER TABLE users 
                        ALTER COLUMN user_type TYPE VARCHAR(60);
                        
                        RAISE NOTICE 'Column user_type updated to VARCHAR(60)';
                    ELSE
                        RAISE NOTICE 'Column user_type is already VARCHAR(60)';
                    END IF;
                END $$;
            """)

            # Check column type and length after update
            cursor.execute("""
                SELECT column_name, data_type, character_maximum_length
                FROM information_schema.columns
                WHERE table_name = 'users'
                AND column_name = 'user_type';
            """)
            after_update = cursor.fetchone()
            logger.info(f"After update - Column details: {after_update}")

            if before_update != after_update:
                logger.info("✅ Column was successfully updated!")
            else:
                logger.info("ℹ️ No update was needed, column already had the correct type")

            return True

        except Exception as e:
            logger.error(f"Error updating schema: {str(e)}")
            return False


def generate_unique_slug(cursor, base_slug):
    """Generate a unique slug by appending a number if needed"""
    try:
        # First try with the base slug
        cursor.execute("""
            SELECT EXISTS(
                SELECT 1 FROM organizer_profiles WHERE slug = %s
            )
        """, [base_slug])
        exists = cursor.fetchone()[0]
        
        if not exists:
            return base_slug
            
        # If base slug exists, try with numbers
        counter = 1
        while counter < 100:  # Prevent infinite loop
            new_slug = f"{base_slug}-{counter}"
            cursor.execute("""
                SELECT EXISTS(
                    SELECT 1 FROM organizer_profiles WHERE slug = %s
                )
            """, [new_slug])
            exists = cursor.fetchone()[0]
            
            if not exists:
                return new_slug
            counter += 1
            
        # If we get here, we've tried 100 times and failed
        raise Exception("Could not generate unique slug after 100 attempts")
        
    except Exception as e:
        logger.error(f"Error in generate_unique_slug: {str(e)}")
        raise e


def create_organizer_profile(user_id, profile_data):
    """Create an organizer profile"""
    with connection.cursor() as cursor:
        try:
            # Generate initial slug from username
            cursor.execute("""
                SELECT username 
                FROM users 
                WHERE id = %s
            """, [user_id])
            username = cursor.fetchone()[0]
            base_slug = username.lower().strip()
            base_slug = ''.join(c if c.isalnum() or c == '-' else '-' for c in base_slug)
            base_slug = '-'.join(filter(None, base_slug.split('-')))
            
            # Generate unique slug
            new_slug = generate_unique_slug(cursor, base_slug)

            cursor.execute("""
                INSERT INTO organizer_profiles (
                    user_id,
                    organization_name,
                    phone,
                    website_url,
                    facebook_url,
                    organization_category,
                    description,
                    profile_picture_url,
                    slug
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                RETURNING user_id;
            """, [
                user_id,
                profile_data.get('organization_name'),
                profile_data.get('phone'),
                profile_data.get('website_url'),
                profile_data.get('facebook_url'),
                profile_data.get('organization_category'),
                profile_data.get('description'),
                profile_data.get('profile_picture_url'),
                new_slug
            ])
            
            return {
                'status': 'success',
                'user_id': cursor.fetchone()[0],
                'slug': new_slug
            }
        except Exception as e:
            logger.error(f"Error creating organizer profile: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }


def update_organizer_slug(user_id, new_slug):
    """Update organizer's slug if it's unique"""
    with connection.cursor() as cursor:
        try:
            # Clean and format the slug
            base_slug = new_slug.lower().strip()
            base_slug = ''.join(c if c.isalnum() or c == '-' else '-' for c in base_slug)
            base_slug = '-'.join(filter(None, base_slug.split('-')))
            
            # Generate unique slug
            unique_slug = generate_unique_slug(cursor, base_slug)
            
            # Update the slug
            cursor.execute("""
                UPDATE organizer_profiles
                SET slug = %s
                WHERE user_id = %s
                RETURNING slug;
            """, [unique_slug, user_id])
            
            result = cursor.fetchone()
            return {
                'status': 'success',
                'slug': result[0] if result else None
            }
        except Exception as e:
            logger.error(f"Error updating organizer slug: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }


def check_slug_availability(slug):
    """Check if a slug is available"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT EXISTS(
                SELECT 1 
                FROM organizer_profiles 
                WHERE slug = %s
            );
        """, [slug.lower()])
        exists = cursor.fetchone()[0]
        return not exists
