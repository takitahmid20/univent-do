"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe, FaCalendarAlt, FaUsers, FaStar } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const OrganizerDetailsPage = () => {
  const params = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchOrganizerDetails = async () => {
      try {
        const response = await axios.get(`https://univent-backend.onrender.com/api/accounts/organizers/${params.slug}/`);
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
      <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-[#f6405f] to-[#ff8144]">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex items-center">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 w-full">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <img
                src={organizer.logo || '/default-organizer-logo.png'}
                alt={organizer.organization_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{organizer.organization_name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-sm">
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
              {(activeTab === 'upcoming' ? (organizer.upcoming_events || []).filter(Boolean) : []).map((event, index) => (
                <Link 
                  href={`/events/${event.slug}`} 
                  key={index}
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative w-full h-48">
                      <Image
                        src={event.image_url || '/placeholder-event.jpg'}
                        alt={event.title}
                        fill
                        className="object-cover rounded-t-xl"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-[#f6405f]" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-[#f6405f]" />
                            <span>{event.venue}</span>
                          </div>
                        )}
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
