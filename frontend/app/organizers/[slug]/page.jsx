"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe, FaCalendarAlt, FaUsers, FaStar } from 'react-icons/fa';
import Link from 'next/link';

const OrganizerDetailsPage = () => {
  const params = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchOrganizerDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5656/api/accounts/organizers/${params.slug}/`);
        if (response.data.status === 'success') {
          setOrganizer(response.data.data);
        } else {
          setError('Failed to fetch organizer details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerDetails();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-red-500">
          {error || 'Organizer not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-[#f6405f] to-[#ff8144]">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex items-center">
          <div className="flex items-center gap-8">
            <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
              <img
                src={organizer.logo || '/default-organizer-logo.png'}
                alt={organizer.organization_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-4">{organizer.organization_name}</h1>
              <div className="flex items-center gap-6 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {organizer.category}
                </span>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>{organizer.total_events} Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>5k+ Attendees</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Info */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 mb-6">
                {organizer.description || 'A passionate event organizer dedicated to creating memorable experiences.'}
              </p>
              
              <div className="space-y-4">
                {organizer.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaMapMarkerAlt className="text-[#f6405f]" />
                    <span>{organizer.location}</span>
                  </div>
                )}
                {organizer.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaEnvelope className="text-[#f6405f]" />
                    <a href={`mailto:${organizer.email}`} className="hover:text-[#f6405f]">
                      {organizer.email}
                    </a>
                  </div>
                )}
                {organizer.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaPhone className="text-[#f6405f]" />
                    <a href={`tel:${organizer.phone}`} className="hover:text-[#f6405f]">
                      {organizer.phone}
                    </a>
                  </div>
                )}
                {organizer.website && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaGlobe className="text-[#f6405f]" />
                    <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#f6405f]">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#f6405f] mb-1">{organizer.total_events}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#f6405f] mb-1">5k+</div>
                  <div className="text-sm text-gray-600">Attendees</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#f6405f] mb-1">4.8</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#f6405f] mb-1">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Events */}
          <div className="w-full lg:w-2/3">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'text-[#f6405f] border-b-2 border-[#f6405f]'
                    : 'text-gray-500 hover:text-[#f6405f]'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'text-[#f6405f] border-b-2 border-[#f6405f]'
                    : 'text-gray-500 hover:text-[#f6405f]'
                }`}
              >
                Past Events
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(activeTab === 'upcoming' ? organizer.upcoming_events : []).map((event, index) => (
                <Link href={`/events/${event.toLowerCase().replace(/\s+/g, '-')}`} key={index}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="relative h-48">
                      <img
                        src="/event-placeholder.jpg"
                        alt={event}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-[#f6405f]">
                        Upcoming
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-[#f6405f] transition-colors">
                        {event}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt />
                          <span>Coming Soon</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          <span>TBA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Events Message */}
            {((activeTab === 'upcoming' ? organizer.upcoming_events : []) || []).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No {activeTab} events
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'upcoming'
                    ? 'Stay tuned for new events from this organizer'
                    : 'No past events to show'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDetailsPage;
