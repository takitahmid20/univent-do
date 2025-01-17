"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaFilter, FaTimes, FaUser } from 'react-icons/fa';
import axios from 'axios';
import EventBox from '@/components/EventBox';

// Separate component for the events content
const EventsContent = () => {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    category: searchParams?.get('category') || '',
    date: '',
    priceRange: ''
  });

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters(prev => ({ ...prev, search: value }));
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://univent-backend.onrender.com/api/events/');
        console.log('API Response:', response.data);

        // Extract events from response
        let allEvents = response.data.events || [];
        console.log('All events:', allEvents);

        // Transform event data to match frontend structure
        allEvents = allEvents.map(event => ({
          ...event,
          eventDate: event.event_date,
          eventTime: event.event_time,
          ticketPrice: event.ticket_price ? parseFloat(event.ticket_price) : 0,
          imageUrl: event.image_url,
          organizerImage: event.organizer_image
        }));

        // Apply filters
        let filteredEvents = [...allEvents];

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredEvents = filteredEvents.filter(event =>
            event.title?.toLowerCase().includes(searchTerm) ||
            event.venue?.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.category && filters.category !== 'All Categories') {
          filteredEvents = filteredEvents.filter(event =>
            event.category === filters.category
          );
        }

        if (filters.date) {
          const today = new Date();
          
          switch (filters.date) {
            case 'today':
              filteredEvents = filteredEvents.filter(event =>
                new Date(event.eventDate).toDateString() === today.toDateString()
              );
              break;
            case 'week':
              const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              filteredEvents = filteredEvents.filter(event =>
                new Date(event.eventDate) >= today && new Date(event.eventDate) <= weekFromNow
              );
              break;
            case 'month':
              const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
              filteredEvents = filteredEvents.filter(event =>
                new Date(event.eventDate) >= today && new Date(event.eventDate) <= monthFromNow
              );
              break;
          }
        }

        if (filters.priceRange) {
          switch (filters.priceRange) {
            case 'free':
              filteredEvents = filteredEvents.filter(event => event.ticketPrice === 0);
              break;
            case 'under-500':
              filteredEvents = filteredEvents.filter(event => event.ticketPrice < 500);
              break;
            case '500-1000':
              filteredEvents = filteredEvents.filter(event => event.ticketPrice >= 500 && event.ticketPrice <= 1000);
              break;
            case 'above-1000':
              filteredEvents = filteredEvents.filter(event => event.ticketPrice > 1000);
              break;
          }
        }

        console.log('Filtered events:', filteredEvents);
        setEvents(filteredEvents);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    if (key === 'search') return; // Search is handled separately now
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      category: '',
      date: '',
      priceRange: ''
    });
  };

  const categories = [
    'All Categories',
    'Conference',
    'Workshop',
    'Seminar',
    'Hackathon',
    'Meetup',
    'Cultural'
  ];

  const dateFilters = [
    { label: 'All Dates', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' }
  ];

  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Free', value: 'free' },
    { label: 'Under ৳500', value: 'under-500' },
    { label: '৳500 - ৳1000', value: '500-1000' },
    { label: 'Above ৳1000', value: 'above-1000' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 mt-16">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          <p className="font-medium">Error loading events</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 mt-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h4 className="text-[#f6405f] font-medium mb-2">Discover Events</h4>
          <h1 className="text-3xl font-bold text-gray-800">
            Upcoming Events
          </h1>
        </div>
        
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm"
        >
          <FaFilter />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Search and Filters Section */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-8`}>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#f6405f]"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-[#f6405f]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-[#f6405f]"
            >
              {dateFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-[#f6405f]"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#f6405f] transition-colors"
            >
              <FaTimes />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventBox key={event.id} event={event} />
        ))}
      </div>

      {/* No Events Message */}
      {events.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main page component with Suspense
const EventsPage = () => {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
};

export default EventsPage;