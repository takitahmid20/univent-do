erDiagram
    users ||--|| attendee_profiles : "has"
    users ||--|| organizer_profiles : "has"
    users ||--o{ events : "organizes"
    users ||--o{ event_registrations : "registers"
    users {
        uuid id PK
        varchar email
        varchar username
        varchar password
        varchar user_type "attendee/organizer"
        timestamp created_at
        timestamp updated_at
    }

    attendee_profiles {
        uuid user_id PK,FK
        varchar full_name
        varchar phone
        varchar university
        varchar department
        varchar location
        text profile_picture_url
        timestamp joined_date
    }

    organizer_profiles {
        uuid user_id PK,FK
        varchar organization_name
        varchar phone
        text website_url
        text facebook_url
        varchar organization_category
        text description
        text profile_picture_url
        timestamp joined_date
    }

    events ||--o{ event_registrations : "has"
    events {
        uuid id PK
        uuid organizer_id FK
        varchar title
        text description
        varchar category
        varchar event_type "public/private"
        varchar venue
        text address
        date event_date
        time event_time
        decimal ticket_price
        integer max_attendees
        text image_url
        varchar status "upcoming/ongoing/completed/cancelled"
        varchar publication_status "draft/published"
        text slug
        timestamp created_at
        timestamp updated_at
    }

    event_registrations {
        uuid id PK
        uuid event_id FK
        uuid attendee_id FK
        integer number_of_seats
        decimal total_amount
        text additional_info
        text dietary_requirements
        varchar t_shirt_size
        text qr_code
        timestamp registration_date
        varchar status "pending/approved/rejected/cancelled"
    }

    invalid_tokens {
        uuid id PK
        text token
        timestamp invalidated_at
        timestamp expires_at
    }