'use client';

import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEdit, FaQrCode } from 'react-icons/fa';

export default function EventCard({ event, viewMode = 'grid' }) {
  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="relative h-48">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.isPublished 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {event.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-medium text-lg mb-2">{event.title}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="w-4 h-4" />
              <span>{event.registeredCount}/{event.maxCapacity} registered</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-[#f6405f]">
              ${event.price}
            </span>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-[#f6405f]">
                <FaQrCode />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <FaEdit />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex gap-6">
        <img
          src={event.image}
          alt={event.title}
          className="w-32 h-32 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium text-lg">{event.title}</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaUsers className="w-4 h-4" />
                  <span>{event.registeredCount}/{event.maxCapacity}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-[#f6405f]">
                <FaQrCode />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <FaEdit />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}