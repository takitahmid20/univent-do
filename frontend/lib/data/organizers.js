// lib/data/organizers.js
// Create this file to store your data structure

export const organizers = [
    {
      id: 1,
      name: "TechEvents Pro",
      image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg",
      logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
      verified: true,
      rating: 4.8,
      reviewCount: 120,
      eventCount: 45,
      category: "Technology",
      followers: 1200,
      featuredEvents: [
        { id: 1, title: "Tech Summit 2024" },
        { id: 2, title: "AI Conference" },
        { id: 3, title: "Developer Meetup" },
      ],
    },
    {
      id: 2,
      name: "Music Festivals Inc",
      image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg",
      logo: "https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg",
      verified: true,
      rating: 4.9,
      reviewCount: 230,
      eventCount: 38,
      category: "Music",
      followers: 2500,
      featuredEvents: [
        { id: 1, title: "Summer Music Festival" },
        { id: 2, title: "Rock Concert Night" },
        { id: 3, title: "Jazz Evening" },
      ],
    },
    {
      id: 3,
      name: "EduEvents",
      image: "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg",
      logo: "https://images.pexels.com/photos/207756/pexels-photo-207756.jpeg",
      verified: true,
      rating: 4.7,
      reviewCount: 180,
      eventCount: 55,
      category: "Education",
      followers: 1800,
      featuredEvents: [
        { id: 1, title: "Leadership Workshop" },
        { id: 2, title: "Digital Marketing Course" },
        { id: 3, title: "Business Summit" },
      ],
    },
  ];