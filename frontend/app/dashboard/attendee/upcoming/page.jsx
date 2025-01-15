'use client';

import { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaSearch,
  FaFilter,
  FaRegBell,
  FaComments,
  FaBan
} from 'react-icons/fa';
import events from '@/lib/data/eventData';

// Get unique categories from events
const categories = ['All', ...new Set(events.map(event => event.category))];

export default function UpcomingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter events based on search and category
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = [...events];

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(event =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(event => event.category === selectedCategory);
      }

      // Sort by date (assuming you want upcoming events first)
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

      setFilteredEvents(filtered);
      setIsLoading(false);
    }, 500); // Simulate loading delay
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Upcoming Events</h1>
          <p className="text-gray-600 mt-1">
            You have {filteredEvents.length} upcoming events
          </p>
        </div>
        <button className="bg-[#f6405f] text-white px-4 py-2 rounded-lg hover:bg-[#d63850] transition-colors">
          Browse More Events
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#f6405f] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  {/* Event Image */}
                  <div className="relative h-48">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="px-3 py-1 bg-white/90 text-[#f6405f] text-sm font-medium rounded-full">
                        ${event.price}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[#f6405f] bg-[#f6405f]/10 px-2 py-1 rounded">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaClock className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t my-4"></div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={event.organizer.logo}
                          alt={event.organizer.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-600">{event.organizer.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          title="Set Reminder"
                          className="p-2 text-gray-400 hover:text-[#f6405f] transition-colors"
                        >
                          <FaRegBell className="w-5 h-5" />
                        </button>
                        <button
                          title="Chat Group"
                          className="p-2 text-gray-400 hover:text-[#f6405f] transition-colors"
                        >
                          <FaComments className="w-5 h-5" />
                        </button>
                        <button
                          title="Cancel Registration"
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaBan className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-[#f6405f] text-white px-4 py-2 rounded-lg hover:bg-[#d63850] transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No Events Found State
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaCalendarAlt className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'All' 
                  ? "Try adjusting your filters or search terms"
                  : "You haven't registered for any upcoming events yet."}
              </p>
              <button className="mt-4 bg-[#f6405f] text-white px-6 py-2 rounded-lg hover:bg-[#d63850] transition-colors">
                Browse Events
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}