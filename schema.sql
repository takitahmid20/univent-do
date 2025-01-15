-- Create extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(60) NOT NULL CHECK (user_type IN ('attendee', 'organizer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendee Profiles table
CREATE TABLE attendee_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    university VARCHAR(255),
    department VARCHAR(255),
    location VARCHAR(255),
    profile_picture_url TEXT,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organizer Profiles table
CREATE TABLE organizer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255),
    phone VARCHAR(20),
    website_url TEXT,
    facebook_url TEXT,
    organization_category VARCHAR(100),
    description TEXT,
    profile_picture_url TEXT,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'public',
    venue VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_attendees INTEGER,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    publication_status VARCHAR(20) DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published')),
    slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Registrations table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    number_of_seats INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    additional_info TEXT,
    dietary_requirements TEXT,
    t_shirt_size VARCHAR(10),
    qr_code TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    UNIQUE(event_id, attendee_id)
);

-- Invalid Tokens table (for token blacklisting)
CREATE TABLE invalid_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    invalidated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(token)
);

-- Create indexes for better query performance
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_publication ON events(publication_status);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_attendee ON event_registrations(attendee_id);
CREATE INDEX idx_registrations_status ON event_registrations(status);

-- Create useful views
CREATE OR REPLACE VIEW upcoming_events AS
SELECT 
    e.*,
    op.organization_name,
    op.profile_picture_url as organizer_image,
    COUNT(er.id) as registration_count
FROM events e
JOIN organizer_profiles op ON e.organizer_id = op.user_id
LEFT JOIN event_registrations er ON e.id = er.event_id
WHERE 
    e.event_date >= CURRENT_DATE 
    AND e.publication_status = 'published'
GROUP BY e.id, op.organization_name, op.profile_picture_url
ORDER BY e.created_at DESC;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();