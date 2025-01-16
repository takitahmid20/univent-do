"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

const OrganizersPage = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const response = await axios.get('https://univent-backend.onrender.com/api/accounts/organizers/');
        if (response.data.status === 'success') {
          setOrganizers(response.data.data);
        } else {
          setError('Failed to fetch organizers');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  // Get unique categories from organizers
  const categories = [...new Set(organizers.map(org => org.category))].filter(Boolean);

  // Filter organizers based on search and category
  const filteredOrganizers = organizers.filter(organizer => {
    const matchesSearch = organizer.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || organizer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
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
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Page Header */}
      <div className="text-center mb-8 md:mb-12 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
          Event Organizers
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Discover and connect with our diverse community of event organizers. From tech conferences to music festivals, find the perfect organizer for your next event experience.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 md:mb-10 space-y-4 md:space-y-0 md:flex md:flex-row md:gap-4 md:items-center md:justify-between px-4">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1 md:max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm md:text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm md:text-base text-gray-600 whitespace-nowrap">Filter by:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 md:flex-none px-3 md:px-4 py-2.5 text-sm md:text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 md:mb-6 text-sm md:text-base text-gray-600 px-4">
        Showing {filteredOrganizers.length} organizers
      </div>

      {/* Organizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
        {filteredOrganizers.map((organizer) => (
          <Link 
            href={`/organizers/${organizer.slug}`}
            key={organizer.id}
          >
            <div className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group p-4 md:p-6">
              {/* Profile Section */}
              <div className="flex items-start gap-3 md:gap-4">
                {/* Logo */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm flex-shrink-0">
                  <img
                    src={organizer.logo || '/default-organizer-logo.png'}
                    alt={`${organizer.organization_name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Organizer Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2 truncate">
                    {organizer.organization_name}
                  </h3>

                  {/* Category & Stats */}
                  <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-500 gap-2 md:gap-3">
                    <span className="bg-gray-100 px-2 py-1 rounded-full truncate">
                      {organizer.category}
                    </span>
                    <span>{organizer.total_events} events</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              {organizer.upcoming_events && organizer.upcoming_events.length > 0 && (
                <div className="mt-3 md:mt-4">
                  <h4 className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Upcoming Events
                  </h4>
                  <div className="space-y-0.5 md:space-y-1">
                    {organizer.upcoming_events.map((event, index) => (
                      <p 
                        key={index}
                        className="text-xs md:text-sm text-gray-600 truncate hover:text-[#f6405f]"
                      >
                        {event}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredOrganizers.length === 0 && (
        <div className="text-center py-8 md:py-12 px-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
            No organizers found
          </h3>
          <p className="text-sm md:text-base text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default OrganizersPage;
