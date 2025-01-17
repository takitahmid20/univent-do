'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMapMarkerAlt,
  FaCalendar,
  FaClock,
  FaLink,
  FaPhone,
  FaFacebook,
  FaGlobe,
  FaUser,
  FaEnvelope,
  FaUsers,
} from 'react-icons/fa';
import JoinEventModal from '@/components/JoinEventModal';
import EventParticipants from './EventParticipants';

const EventDetails = ({ event, API_BASE_URL }) => {
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();
  const eventUrl = typeof window !== 'undefined' ? window.location.href : '';

  console.log('Event data in EventDetails:', event);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    setIsOrganizer(userType === 'organizer');
    setCurrentUserId(userId);
    setIsAuthenticated(!!token);
  }, []);

  const isEventOwner = currentUserId && event?.organizerId && currentUserId === event.organizerId;
  const cannotRegister = isOrganizer || isEventOwner;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTicketClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isEventOwner) {
      alert('You cannot register for your own event');
      return;
    }

    if (isOrganizer) {
      alert('Organizers cannot register for events');
      return;
    }

    setIsModalOpen(true);
  };

  const handleLogin = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    router.push('/signin');
  };

  const handleSignup = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    router.push('/signup');
  };

  if (!event || event.publicationStatus !== 'published') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
        <img
          src={event.imageUrl?.startsWith('http') ? event.imageUrl : '/default-event-image.jpg'}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-event-image.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-white">
            <div className="flex items-center gap-2">
              <FaCalendar />
              <span>{formatDate(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock />
              <span>{formatTime(event.eventTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - About Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">About This Event</h3>
            <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
          </div>

          {/* Ticket Design Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Ticket Preview</h3>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Ticket Container */}
              <div className="relative">
                {/* Dashed Border on Left */}
                <div className="absolute left-0 top-0 bottom-0 w-[1px] border-l-2 border-dashed border-gray-300"></div>
                
                {/* Scissors Icon */}
                <div className="absolute -left-2.5 top-1/2 transform -translate-y-1/2 bg-gray-50 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 1 1-1.83 6.5L2 10l1.67 1.5A3.5 3.5 0 1 1 5.5 18a3.5 3.5 0 0 1-1.83-6.5L2 10l1.67-1.5A3.5 3.5 0 0 1 5.5 2zM16.17 8.5A3.5 3.5 0 1 1 14.5 2a3.5 3.5 0 0 1 1.67 6.5L18 10l-1.67 1.5a3.5 3.5 0 1 1-1.67 6.5 3.5 3.5 0 0 1 1.67-6.5L18 10l-1.67-1.5z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Ticket Content */}
                <div className="pl-8 pr-6 py-6">
                  {/* Event Title */}
                  <h2 className="text-2xl font-bold text-[#f6405f] mb-4">{event.title}</h2>
                  
                  {/* Event Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">
                        {formatDate(event.eventDate)}
                        <br />
                        {formatTime(event.eventTime)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="font-medium">{event.venue}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">
                        {event.ticketPrice > 0 ? `$${event.ticketPrice}` : 'Free'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{event.category}</p>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Organized by</p>
                    <p className="font-medium">{event.organizer?.organizationName}</p>
                  </div>

                  {/* Get Ticket Button */}
                  <button
                    onClick={handleTicketClick}
                    disabled={cannotRegister}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                      cannotRegister
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#f6405f] hover:bg-[#d63850]'
                    }`}
                  >
                    {isEventOwner 
                      ? 'Cannot Register for Own Event' 
                      : isOrganizer 
                        ? 'Organizers Cannot Register' 
                        : 'Get Ticket'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Registration Card */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-[#f6405f] mb-4">
              {event.ticketPrice > 0 ? `$${event.ticketPrice}` : 'Free'}
            </div>
            
            {/* Available Seats */}
            <div className="flex items-center justify-between text-gray-600 mb-6">
              <span>Available Seats:</span>
              <span className="font-medium">
                {event.maxAttendees - event.registrationStats.totalRegistrations} of {event.maxAttendees}
              </span>
            </div>

            <button
              onClick={handleTicketClick}
              disabled={cannotRegister}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                cannotRegister
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#f6405f] hover:bg-[#d63850]'
              }`}
            >
              {isEventOwner 
                ? 'Cannot Register for Own Event' 
                : isOrganizer 
                  ? 'Organizers Cannot Register' 
                  : 'Register Now'}
            </button>
          </div>

          {/* Share Event Section */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Share Event</h3>
              {showCopyAlert && (
                <div className="text-green-600 text-sm">Link copied!</div>
              )}
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-[#f6405f] border border-gray-200 rounded-lg hover:border-[#f6405f] transition-all"
            >
              <FaLink />
              <span>Copy Link</span>
            </button>
          </div>

          {/* Organizer Info */}
          {event.organizer && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-4">Event Organizer</h3>
              <div className="space-y-4">
                {/* Organizer Profile Image */}
                {event.organizer.profilePictureUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={event.organizer.profilePictureUrl} 
                      alt={event.organizer.organizationName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#f6405f]"
                    />
                  </div>
                )}
                
                {/* Organization Name */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold">{event.organizer.organizationName}</h4>
                  {event.organizer.organizationCategory && (
                    <p className="text-gray-600">{event.organizer.organizationCategory}</p>
                  )}
                </div>

                {/* Description */}
                {event.organizer.description && (
                  <p className="text-gray-600 text-sm">{event.organizer.description}</p>
                )}

                {/* Contact Information */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                  {event.organizer.phone && (
                    <a 
                      href={`tel:${event.organizer.phone}`} 
                      className="text-gray-600 hover:text-[#f6405f] transition-colors"
                      title={event.organizer.phone}
                    >
                      <FaPhone size={20} />
                    </a>
                  )}
                  
                  {event.organizer.websiteUrl && (
                    <a 
                      href={event.organizer.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#f6405f] transition-colors"
                      title="Visit Website"
                    >
                      <FaGlobe size={20} />
                    </a>
                  )}

                  {event.organizer.facebookUrl && (
                    <a 
                      href={event.organizer.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#f6405f] transition-colors"
                      title="Facebook Page"
                    >
                      <FaFacebook size={20} />
                    </a>
                  )}

                  {event.organizer.email && (
                    <a 
                      href={`mailto:${event.organizer.email}`}
                      className="text-gray-600 hover:text-[#f6405f] transition-colors"
                      title={event.organizer.email}
                    >
                      <FaEnvelope size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants List (Only for organizers) */}
      {isOrganizer && showParticipants && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Event Participants</h2>
          <EventParticipants eventId={event.id} />
        </div>
      )}

      {/* Copy Link Alert */}
      {showCopyAlert && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
          Link copied to clipboard!
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to register for this event. Please sign in or create an account to continue.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleLogin}
                className="w-full bg-[#f6405f] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#d63850] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignup}
                className="w-full border border-[#f6405f] text-[#f6405f] px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Event Modal */}
      {isModalOpen && (
        <JoinEventModal
          event={event}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default EventDetails;