
-- =============================================
-- Database Schema for UniVent Event Management System
-- A beginner-friendly guide to understanding the tables
-- =============================================

-- First, we need to enable UUID support in PostgreSQL
-- UUID is a special type that generates unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------
-- Table: users
-- Purpose: Stores all user accounts
-- -----------------------------
CREATE TABLE users (
    -- Primary key using UUID (Universal Unique Identifier)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic user information
    email VARCHAR(255) UNIQUE NOT NULL,  -- Must be unique and cannot be empty
    username VARCHAR(255) UNIQUE NOT NULL,  -- Must be unique and cannot be empty
    password VARCHAR(255) NOT NULL,  -- Stored as hashed password
    
    -- User type can only be 'attendee' or 'organizer'
    user_type VARCHAR(60) NOT NULL CHECK (user_type IN ('attendee', 'organizer')),
    
    -- Timestamps for tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  -- When user was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP   -- When user was last updated
);

-- -----------------------------
-- Table: attendee_profiles
-- Purpose: Additional information for attendee users
-- -----------------------------
CREATE TABLE attendee_profiles (
    -- Uses the user's ID as both primary key and foreign key
    user_id UUID PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- Delete profile when user is deleted
    
    -- Profile information
    full_name VARCHAR(255),
    phone VARCHAR(20),
    university VARCHAR(255),
    department VARCHAR(255),
    location VARCHAR(255),
    profile_picture_url TEXT,  -- URL to profile picture
    
    -- When the profile was created
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------
-- Table: organizer_profiles
-- Purpose: Additional information for event organizer users
-- -----------------------------
CREATE TABLE organizer_profiles (
    -- Uses the user's ID as both primary key and foreign key
    user_id UUID PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Organization information
    organization_name VARCHAR(255),
    phone VARCHAR(20),
    website_url TEXT,
    facebook_url TEXT,
    organization_category VARCHAR(100),
    description TEXT,
    profile_picture_url TEXT,
    
    -- When the profile was created
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------
-- Table: events
-- Purpose: Stores all event information
-- -----------------------------
CREATE TABLE events (
    -- Basic event identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Links to the organizer
    organizer_id UUID NOT NULL,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event categorization and type
    category VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'public',  -- Can be 'public' or 'private'
    
    -- Event location details
    venue VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    
    -- Event timing
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    
    -- Event capacity and pricing
    ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0,  -- Maximum 2 decimal places
    max_attendees INTEGER,
    
    -- Media
    image_url TEXT,
    
    -- Event status tracking
    status VARCHAR(50) DEFAULT 'upcoming' 
        CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    publication_status VARCHAR(20) DEFAULT 'draft'
        CHECK (publication_status IN ('draft', 'published')),
    
    -- URL-friendly version of title
    slug TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------
-- Table: event_registrations
-- Purpose: Tracks who is registered for which events
-- -----------------------------
CREATE TABLE event_registrations (
    -- Registration identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links to event and attendee
    event_id UUID NOT NULL,
    attendee_id UUID NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (attendee_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Registration details
    number_of_seats INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Additional attendee information
    additional_info TEXT,
    dietary_requirements TEXT,
    t_shirt_size VARCHAR(10),
    
    -- QR code for event check-in
    qr_code TEXT,
    
    -- When they registered
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Registration status
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Prevent duplicate registrations
    UNIQUE(event_id, attendee_id)
);

-- -----------------------------
-- Table: invalid_tokens
-- Purpose: Keeps track of logged-out or expired tokens
-- -----------------------------
CREATE TABLE invalid_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    invalidated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- -----------------------------
-- Creating Indexes
-- Purpose: Make searching and sorting faster
-- -----------------------------

-- Indexes for events table
CREATE INDEX idx_events_organizer ON events(organizer_id);  -- Find events by organizer
CREATE INDEX idx_events_date ON events(event_date);         -- Find events by date
CREATE INDEX idx_events_status ON events(status);           -- Find events by status
CREATE INDEX idx_events_publication ON events(publication_status);  -- Find published/draft events
CREATE INDEX idx_events_slug ON events(slug);               -- Find events by slug

-- Indexes for event_registrations table
CREATE INDEX idx_registrations_event ON event_registrations(event_id);     -- Find registrations by event
CREATE INDEX idx_registrations_attendee ON event_registrations(attendee_id);  -- Find registrations by attendee
CREATE INDEX idx_registrations_status ON event_registrations(status);      -- Find registrations by status

-- -----------------------------
-- Creating Views
-- Purpose: Commonly used combinations of data
-- -----------------------------

-- View: upcoming_events
-- Shows all published upcoming events with organizer information and registration count
CREATE OR REPLACE VIEW upcoming_events AS
SELECT 
    e.*,                                    -- All event information
    op.organization_name,                   -- Organization name
    op.profile_picture_url as organizer_image,  -- Organizer's profile picture
    COUNT(er.id) as registration_count      -- Number of registrations
FROM events e
JOIN organizer_profiles op ON e.organizer_id = op.user_id
LEFT JOIN event_registrations er ON e.id = er.event_id
WHERE 
    e.event_date >= CURRENT_DATE           -- Only future events
    AND e.publication_status = 'published'  -- Only published events
GROUP BY 
    e.id, 
    op.organization_name, 
    op.profile_picture_url
ORDER BY 
    e.created_at DESC;                     -- Newest events first

-- -----------------------------
-- Creating Triggers
-- Purpose: Automatically update timestamps
-- -----------------------------

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;  -- Set new timestamp
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for events table
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();