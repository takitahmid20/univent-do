// lib/data/eventDetails.js
export async function getEventBySlug(slug) {
    // Mock data for example event
    const events = {
      'tech-conference-2024': {
        id: "1",
        title: "Tech Conference 202444",
        slug: "tech-conference-20245",
        image: "https://images.pexels.com/photos/8348740/pexels-photo-8348740.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        category: "Technology",
        organizer: {
          name: "Tech Innovations Global",
          logo: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
          description: "Leading technology conference organizer with a decade of experience in hosting world-class tech events.",
          location: "San Francisco, CA",
          rating: 4.9,
          totalEvents: 120,
          expertise: ["Technology", "AI & ML", "Digital Transformation", "Innovation"],
          contactInfo: {
            phone: "+1 234 567 8900",
            email: "contact@techinnovations.com",
            website: "https://techinnovations.com"
          },
          socialLinks: {
            facebook: "https://facebook.com/techinnovations",
            twitter: "https://twitter.com/techinnovations",
            linkedin: "https://linkedin.com/company/techinnovations",
            instagram: "https://instagram.com/techinnovations"
          }
        },
        date: "2024-04-16",
        time: "9:00 AM - 6:00 PM",
        location: "Dhaka, Bangladesh",
        price: 299,
        totalSeats: 1000,
        joinedCount: 645,
        description: `Join us for the biggest tech conference of 2024! This full-day event brings together industry leaders, innovators, and technology enthusiasts for an immersive experience in the latest technological advancements.
  
        What to expect:
        • Keynote speeches from industry leaders
        • Interactive workshops and demonstrations
        • AI and Machine Learning tracks
        • Blockchain and Web3 sessions
        • Networking opportunities
        • Product launches and demonstrations
        • One-on-one mentoring sessions
        
        Don't miss this opportunity to be part of the next big technological revolution!`,
        agenda: [
          {
            time: "9:00 AM",
            title: "Registration & Breakfast",
            description: "Check-in and enjoy complimentary breakfast while networking",
            speaker: null,
            additionalInfo: ["Bring your ticket", "ID required"]
          },
          {
            time: "10:00 AM",
            title: "Opening Keynote: The Future of AI",
            description: "Exploring the revolutionary impact of AI on various industries and future predictions",
            speaker: "Dr. Sarah Johnson, AI Research Director",
            additionalInfo: ["Q&A session included"]
          },
          {
            time: "11:30 AM",
            title: "Workshop: Hands-on Machine Learning",
            description: "Interactive session on practical machine learning applications",
            speaker: "Prof. Michael Chen",
            additionalInfo: ["Laptop required", "Basic Python knowledge recommended"]
          },
          {
            time: "1:00 PM",
            title: "Lunch Break & Networking",
            description: "Catered lunch and structured networking session",
            speaker: null,
            additionalInfo: ["Dietary options available"]
          },
          {
            time: "2:00 PM",
            title: "Panel Discussion: Tech Ethics",
            description: "Industry experts discuss ethical considerations in technology development",
            speaker: "Various Industry Leaders",
            additionalInfo: ["Interactive Q&A"]
          },
          {
            time: "3:30 PM",
            title: "Web3 & Blockchain Workshop",
            description: "Practical implementation of blockchain technologies",
            speaker: "Alex Rivera, Blockchain Expert",
            additionalInfo: ["Hands-on exercises"]
          },
          {
            time: "5:00 PM",
            title: "Closing Keynote & Awards",
            description: "Event conclusion and innovation awards ceremony",
            speaker: "Mark Thompson, CEO Tech Innovations",
            additionalInfo: ["Networking reception follows"]
          }
        ],
        requirements: [
          "Laptop for workshops",
          "Conference pass (digital or printed)",
          "Business cards recommended",
          "Basic programming knowledge for technical workshops",
          "Valid ID for check-in"
        ],
        highlights: [
          "20+ Industry Speakers",
          "6 Interactive Workshops",
          "Innovation Awards",
          "Networking App Access",
          "Conference Materials",
          "Recorded Sessions Access"
        ],
        faqs: [
          {
            question: "Is parking available?",
            answer: "Yes, paid parking is available at the convention center."
          },
          {
            question: "What's included in the ticket?",
            answer: "Full conference access, workshops, lunch, refreshments, and networking events."
          },
          {
            question: "Is there a dress code?",
            answer: "Business casual is recommended."
          },
          {
            question: "Are sessions recorded?",
            answer: "Yes, attendees will receive access to recorded sessions after the event."
          }
        ],
        sponsors: [
          {
            name: "TechCorp",
            level: "Platinum",
            logo: "https://example.com/techcorp-logo.png"
          },
          {
            name: "InnovateAI",
            level: "Gold",
            logo: "https://example.com/innovateai-logo.png"
          }
        ],
        venue: {
          name: "San Francisco Convention Center",
          address: "747 Howard Street, San Francisco, CA 94103",
          coordinates: {
            lat: 37.784673,
            lng: -122.4001
          },
          parking: "Available on-site",
          publicTransport: "Powell Street BART Station (0.4 miles)"
        }
      }
    };
  
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  
    // Return event data based on slug
    return events[slug] || null;
  }
  
  export async function getRelatedEvents(category, currentEventId, limit = 3) {
    // Mock related events data
    const relatedEvents = [
      {
        id: "2",
        title: "AI Summit 2024",
        slug: "ai-summit-2024",
        image: "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg",
        category: "Technology",
        date: "2024-05-20",
        location: "New York, NY",
        price: 199
      },
      {
        id: "3",
        title: "DevOps Conference",
        slug: "devops-conference",
        image: "https://images.pexels.com/photos/7096/people-woman-coffee-meeting.jpg",
        category: "Technology",
        date: "2024-06-10",
        location: "Austin, TX",
        price: 149
      },
      {
        id: "4",
        title: "Blockchain Workshop",
        slug: "blockchain-workshop",
        image: "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg",
        category: "Technology",
        date: "2024-07-05",
        location: "Miami, FL",
        price: 99
      }
    ];
  
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  
    // Filter out current event and return limited results
    return relatedEvents
      .filter(event => event.id !== currentEventId)
      .slice(0, limit);
  }
  
  export async function getEventStats(eventId) {
    // Mock statistics data
    const stats = {
      registrations: {
        total: 645,
        trend: "+12% this week",
        breakdown: {
          regular: 450,
          vip: 125,
          student: 70
        }
      },
      demographics: {
        countries: 15,
        cities: 45,
        industries: [
          { name: "Technology", percentage: 45 },
          { name: "Finance", percentage: 20 },
          { name: "Healthcare", percentage: 15 },
          { name: "Other", percentage: 20 }
        ]
      },
      engagement: {
        workshopSignups: 423,
        networkingInterests: 589,
        mentorshipRequests: 89
      }
    };
  
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
  
    return stats;
  }