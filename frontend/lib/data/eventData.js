// lib/data/eventData.js
const events = [
  {
    id: "1",
    image: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Art Exhibition',
    slug: 'art-exhibition',
    category: 'Exhibition',
    organizer: {
      name: 'Art Gallery',
      logo: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Leading art gallery hosting exceptional exhibitions and cultural events.',
      location: 'New York, USA',
      rating: 4.8,
      totalEvents: 50,
      expertise: ['Contemporary Art', 'Exhibitions', 'Art Shows', 'Cultural Events'],
      contactInfo: {
        phone: '+1 (555) 123-4567',
        email: 'contact@artgallery.com',
        website: 'https://artgallery.com'
      },
      socialLinks: {
        facebook: 'https://facebook.com/artgallery',
        instagram: 'https://instagram.com/artgallery',
        twitter: 'https://twitter.com/artgallery'
      }
    },
    date: '15 Nov 2022',
    time: '10:00 AM - 8:00 PM',
    location: 'New York, USA',
    joinedCount: 78,
    totalSeats: 150,
    price: 50,
    description: `Experience the finest contemporary art at our exclusive Art Exhibition. This showcase brings together brilliant artists from around the world, presenting their masterpieces in an immersive gallery setting.

    Highlights:
    • Featured works from 20+ international artists
    • Interactive art installations
    • Live art demonstrations
    • Meet and greet with artists
    • Wine and refreshments served

    Join us for an unforgettable journey through the world of contemporary art, where creativity knows no bounds.`,
    agenda: [
      {
        time: "10:00 AM",
        title: "Exhibition Opens",
        description: "Doors open to the public",
      },
      {
        time: "11:30 AM",
        title: "Guided Tour",
        description: "Expert-led tour of the exhibition highlights",
        speaker: "Sarah Williams, Art Curator"
      },
      {
        time: "2:00 PM",
        title: "Artist Talk",
        description: "Discussion with featured artists about their work",
        speaker: "Various Artists"
      },
      {
        time: "4:00 PM",
        title: "Live Demonstration",
        description: "Watch artists create live artwork",
        speaker: "Featured Artists"
      },
      {
        time: "6:00 PM",
        title: "Reception",
        description: "Wine and cheese reception with networking"
      }
    ],
    requirements: [
      "Valid ID for entry",
      "Exhibition ticket",
      "No photography allowed in certain areas",
      "Smart casual dress code recommended"
    ]
  },
  {
    id: "2",
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Tech Conference',
    slug: 'tech-conference',
    category: 'Conference',
    organizer: {
      name: 'Tech Global',
      logo: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Leading technology conference organizer bringing innovative minds together.',
      location: 'San Francisco, USA',
      rating: 4.9,
      totalEvents: 120,
      expertise: ['Technology', 'Innovation', 'AI & ML', 'Digital Transformation'],
      contactInfo: {
        phone: '+1 (555) 987-6543',
        email: 'info@techglobal.com',
        website: 'https://techglobal.com'
      },
      socialLinks: {
        facebook: 'https://facebook.com/techglobal',
        twitter: 'https://twitter.com/techglobal',
        linkedin: 'https://linkedin.com/company/techglobal'
      }
    },
    date: '20 Dec 2022',
    time: '9:00 AM - 6:00 PM',
    location: 'San Francisco, USA',
    joinedCount: 526,
    totalSeats: 1000,
    price: 300,
    description: `Join the most influential tech conference of the year! Connect with industry leaders, innovators, and visionaries shaping the future of technology.

    What to expect:
    • Keynote speeches from tech industry leaders
    • Hands-on workshops and demonstrations
    • Networking opportunities with industry professionals
    • Latest technology showcases
    • Interactive Q&A sessions

    Don't miss this opportunity to be part of the next big technological revolution!`,
    agenda: [
      {
        time: "9:00 AM",
        title: "Registration & Breakfast",
        description: "Check-in and networking breakfast"
      },
      {
        time: "10:00 AM",
        title: "Keynote Speech",
        description: "The Future of Technology",
        speaker: "John Smith, CEO TechGlobal"
      },
      {
        time: "11:30 AM",
        title: "AI Workshop",
        description: "Practical Applications of AI in Business",
        speaker: "Dr. Emily Chen"
      },
      {
        time: "2:00 PM",
        title: "Panel Discussion",
        description: "Digital Transformation Challenges and Solutions",
        speaker: "Industry Leaders Panel"
      },
      {
        time: "4:00 PM",
        title: "Networking Session",
        description: "Connect with speakers and attendees"
      }
    ],
    requirements: [
      "Laptop for workshops",
      "Conference pass",
      "Business cards recommended",
      "Basic technical knowledge"
    ]
  },
  {
    id: "3",
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Food Festival',
    slug: 'food-festival',
    category: 'Festival',
    organizer: {
      name: 'Foodie Events',
      logo: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Creating unforgettable culinary experiences and food festivals.',
      location: 'London, UK',
      rating: 4.7,
      totalEvents: 75,
      expertise: ['Food Festivals', 'Culinary Events', 'Cooking Workshops', 'Food Tourism'],
      contactInfo: {
        phone: '+44 20 7123 4567',
        email: 'hello@foodieevents.com',
        website: 'https://foodieevents.com'
      },
      socialLinks: {
        facebook: 'https://facebook.com/foodieevents',
        instagram: 'https://instagram.com/foodieevents',
        twitter: 'https://twitter.com/foodieevents'
      }
    },
    date: '5 Jan 2023',
    time: '11:00 AM - 9:00 PM',
    location: 'London, UK',
    joinedCount: 327,
    totalSeats: 500,
    price: 80,
    description: `Immerse yourself in a culinary adventure at London's premier Food Festival! Experience diverse cuisines, cooking demonstrations, and food tastings from renowned chefs.

    Festival Features:
    • International food stalls
    • Live cooking demonstrations
    • Wine and craft beer tastings
    • Celebrity chef appearances
    • Interactive cooking workshops
    • Live entertainment

    Come hungry, leave happy!`,
    agenda: [
      {
        time: "11:00 AM",
        title: "Festival Opens",
        description: "Food stalls and exhibitions open to public"
      },
      {
        time: "12:30 PM",
        title: "Cooking Demonstration",
        description: "International Cuisine Showcase",
        speaker: "Chef Maria Rodriguez"
      },
      {
        time: "2:00 PM",
        title: "Wine Tasting",
        description: "Guided wine tasting session",
        speaker: "Master Sommelier James Wilson"
      },
      {
        time: "4:00 PM",
        title: "Baking Workshop",
        description: "Learn to make artisan bread",
        speaker: "Chef Thomas Brown"
      },
      {
        time: "6:00 PM",
        title: "Evening Entertainment",
        description: "Live music and food demonstrations"
      }
    ],
    requirements: [
      "Festival wristband",
      "Valid ID for alcohol tastings",
      "Cash/cards for food purchases",
      "Comfortable shoes recommended"
    ]
  },
  {
    id: "4",
    image: 'https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Sports Tournament',
    slug: 'sports-tournament',
    category: 'Competition',
    organizer: {
      name: 'Sports League',
      logo: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Premier sports event organizer delivering world-class tournaments.',
      location: 'Sydney, Australia',
      rating: 4.6,
      totalEvents: 200,
      expertise: ['Sports Events', 'Tournaments', 'Athletic Competitions', 'Youth Sports'],
      contactInfo: {
        phone: '+61 2 8765 4321',
        email: 'info@sportsleague.com',
        website: 'https://sportsleague.com'
      },
      socialLinks: {
        facebook: 'https://facebook.com/sportsleague',
        instagram: 'https://instagram.com/sportsleague',
        twitter: 'https://twitter.com/sportsleague'
      }
    },
    date: '12 Feb 2023',
    time: '8:00 AM - 6:00 PM',
    location: 'Sydney, Australia',
    joinedCount: 218,
    totalSeats: 500,
    price: 100,
    description: `Experience the thrill of competition at our annual Sports Tournament! Athletes from across the region compete in multiple sports categories.

    Tournament Highlights:
    • Multiple sports categories
    • Professional referees
    • Live scoring system
    • Medical team on standby
    • Awards ceremony
    • Food and beverage stands

    Come witness the spirit of competition!`,
    agenda: [
      {
        time: "8:00 AM",
        title: "Registration",
        description: "Team check-in and warm-up"
      },
      {
        time: "9:00 AM",
        title: "Opening Ceremony",
        description: "Tournament inauguration and announcements",
        speaker: "Tournament Director"
      },
      {
        time: "10:00 AM",
        title: "Preliminary Rounds",
        description: "Group stage matches begin"
      },
      {
        time: "2:00 PM",
        title: "Quarter Finals",
        description: "Knockout stage begins"
      },
      {
        time: "5:00 PM",
        title: "Finals & Awards",
        description: "Championship matches and ceremony"
      }
    ],
    requirements: [
      "Team registration confirmation",
      "Sports gear and equipment",
      "Medical clearance",
      "Photo ID",
      "Signed waiver form"
    ]
  },
  {
    id: "5",
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Business Seminar',
    slug: 'business-seminar',
    category: 'Seminar',
    organizer: {
      name: 'Biz Guru',
      logo: 'https://images.pexels.com/photos/935756/pexels-photo-935756.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Leading business education and networking event organizer.',
      location: 'Singapore',
      rating: 4.8,
      totalEvents: 150,
      expertise: ['Business Education', 'Leadership Training', 'Entrepreneurship', 'Professional Development'],
      contactInfo: {
        phone: '+65 6789 0123',
        email: 'contact@bizguru.com',
        website: 'https://bizguru.com'
      },
      socialLinks: {
        facebook: 'https://facebook.com/bizguru',
        linkedin: 'https://linkedin.com/company/bizguru',
        twitter: 'https://twitter.com/bizguru'
      }
    },
    date: '18 Mar 2023',
    time: '9:00 AM - 5:00 PM',
    location: 'Singapore',
    joinedCount: 92,
    totalSeats: 200,
    price: 150,
    description: `Elevate your business acumen at our comprehensive Business Seminar. Learn from industry experts and successful entrepreneurs about the latest business strategies and market trends.

    Seminar Highlights:
    • Expert speakers from various industries
    • Interactive learning sessions
    • Case study discussions
    • Networking opportunities
    • Certificate of completion
    • Comprehensive course materials

    Invest in your professional growth!`,
    agenda: [
      {
        time: "9:00 AM",
        title: "Welcome & Introduction",
        description: "Opening remarks and seminar overview",
        speaker: "David Chen, CEO Biz Guru"
      },
      {
        time: "10:00 AM",
        title: "Market Analysis",
        description: "Current trends and future predictions",
        speaker: "Dr. Sarah Johnson"
      },
      {
        time: "11:30 AM",
        title: "Strategy Workshop",
        description: "Interactive business strategy session",
        speaker: "Michael Wong"
      },
      {
        time: "2:00 PM",
        title: "Leadership Session",
        description: "Effective leadership in modern business",
        speaker: "Lisa Zhang"
      },
      {
        time: "4:00 PM",
        title: "Networking Session",
        description: "Structured networking and closing remarks"
      }
    ],
    requirements: [
      "Business card",
      "Laptop or notebook",
      "Pre-reading materials completion",
      "Professional attire",
      "Registration confirmation"
    ]
  }
];

export async function getEventBySlug(slug) {
  try {
    console.log('Fetching event with slug:', slug);
    const response = await fetch(`http://127.0.0.1:5656/api/events/public/${slug}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Successfully fetched event data:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return null;
  }
}

export async function getAllEvents() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/events/');
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}