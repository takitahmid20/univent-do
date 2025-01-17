// components/EventBox.jsx
"use client";
import { useState } from 'react';
import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Button from '@/components/Button';
import Link from 'next/link';
import JoinEventModal from '@/components/JoinEventModal';

const EventBox = ({ event }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format date to display nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Safely create URL-friendly slug
  const createSlug = (str) => {
    if (!str) return '';
    return str.replace(/\s+/g, '-').toLowerCase();
  };

  if (!event) return null;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image Container with Category Badge */}
      <div className="relative">
        <Link href={`/events/${event.slug || createSlug(event.title) || ''}`}>
          <div className="aspect-[16/9] overflow-hidden">
          <img 
              src={event.imageUrl || '/images/default-event.jpg'} 
              alt={event.title || 'Event'} 
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-event.jpg';
              }}
            />
          </div>
        </Link>
        
        {/* Category Badge */}
        {event.category && (
          <span className="absolute bottom-3 right-3 bg-white/90 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
            {event.category}
          </span>
        )}

        {/* Date Badge */}
        {event.eventDate && (
          <div className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <FaCalendarAlt className="text-[#f6405f]" />
            {formatDate(event.eventDate)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/events/${event.slug || createSlug(event.title) || ''}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-[#f6405f] transition-colors line-clamp-2">
            {event.title || 'Untitled Event'}
          </h3>
        </Link>

        {/* Location */}
        {event.venue && (
          <div className="flex items-center gap-1 mt-2 text-gray-600 text-sm">
            <FaMapMarkerAlt className="text-[#f6405f]" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t my-3"></div>

        {/* Footer Section */}
        <div className="flex items-center justify-between">
          {/* Organizer Info */}
          {event.organizationName && (
            <Link href={`/organizers/${createSlug(event.organizationName)}`}>
              <div className="flex items-center gap-2">
                <img 
                  src={event.organizerImage || '/images/default-organizer.jpg'} 
                  alt={event.organizationName} 
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {event.organizationName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaUser className="text-[#f6405f]" />
                    <span>
                      {event.registrationCount || 0}/{event.maxAttendees || 0} joined
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Price & Join Button */}
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-[#f6405f] mb-1">
              {event.ticketPrice === 0 ? 'Free' : `৳${event.ticketPrice || 0}`}
            </span>
            <Button
              onClick={() => setIsModalOpen(true)} 
              className="text-sm px-4 py-1">
              Join Now
            </Button>
          </div>
          <JoinEventModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            event={event}
          />
        </div>
      </div>
    </div>
  );
};

export default EventBox;