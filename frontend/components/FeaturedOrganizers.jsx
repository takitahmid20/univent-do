"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const FeaturedOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const response = await axios.get('http://localhost:5656/api/accounts/organizers/');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
      {/* Section Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h4 className="text-[#f6405f] font-medium mb-2">Top Organizers</h4>
          <h2 className="text-3xl font-bold text-gray-800">
            Featured Event Organizers
          </h2>
        </div>
        <Link 
          href="/organizers" 
          className="text-gray-500 hover:text-[#f6405f] transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Organizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizers.map((organizer) => (
          <Link 
          href={`/organizers/${(organizer.organization_name || 'unnamed-organizer').toLowerCase().replace(/\s+/g, '-')}`}
          key={organizer.id}
        >
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group p-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                  <img
                    src={organizer.logo || '/default-organizer-logo.png'}
                    alt={`${organizer.organization_name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Organizer Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    {organizer.organization_name}
                  </h3>

                  {/* Category & Stats */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {organizer.category}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{organizer.total_events} events</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              {organizer.upcoming_events && organizer.upcoming_events.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Upcoming Events
                  </h4>
                  <div className="space-y-1">
                    {organizer.upcoming_events.map((event, index) => (
                      <p 
                        key={index}
                        className="text-sm text-gray-600 truncate hover:text-[#f6405f]"
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
    </div>
  );
};

export default FeaturedOrganizers;