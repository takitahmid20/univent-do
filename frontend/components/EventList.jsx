// components/EventList.jsx
"use client";
import React, { useState, useEffect } from 'react';
import EventBox from '@/components/EventBox';
import { FaFilter, FaSort } from 'react-icons/fa';
import Button from '@/components/Button';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('created');  // Changed default to 'created'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch upcoming events sorted by creation date
        const response = await fetch(
          `http://127.0.0.1:5656/api/events/?sortBy=${sortBy}&sortOrder=desc&page=1&pageSize=8`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [sortBy]); // Re-fetch when sort option changes

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Get unique categories from events
  const categories = ['All', ...new Set(events.map(event => event.category))];

  // Filter events by category (sorting is handled by the API)
  const filteredEvents = events
    .filter(event => selectedCategory === 'All' || event.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Upcoming Events</h2>
        <p className="text-gray-600">Discover and join amazing events near you</p>
      </div>

      {/* Filters and Sort Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category 
                  ? 'bg-[#f6405f] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <FaSort className="text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="created">Most Recent</option>
            <option value="date">Event Date</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventBox key={event.id} event={event} />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12">
          <FaFilter className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters to find more events</p>
          <Button onClick={() => setSelectedCategory('All')}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Load More Button */}
      {filteredEvents.length > 0 && (
        <div className="text-center mt-8">
          <Button className="px-8">
            Load More Events
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventList;