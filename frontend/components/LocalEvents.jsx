// components/LocalEvents.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { bangladeshDistricts, divisions, getDistrictsByDivision } from '@/lib/data/bangladesh-districts';
import EventBox from '@/components/EventBox';

const LocalEvents = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Sample local events data
  const localEvents = [
    {
      id: 1,
      image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg",
      title: "Tech Meetup Dhaka",
      category: "Technology",
      organizer: {
        name: "Tech Community BD",
        logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
      },
      date: "15 Mar 2024",
      location: "Dhaka, Bangladesh",
      price: "Free",
      joinedCount: 45,
      totalSeats: 100,
    },
    // Add more events...
  ];

  // Get user's location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Here you would typically make an API call to convert coordinates to district
            // For now, we'll just set Dhaka as an example
            setSelectedDistrict('Dhaka');
          } catch (error) {
            console.error('Error getting location:', error);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    // Get user's location when component mounts
    getCurrentLocation();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-[#f6405f] font-medium mb-2">Local Events</h4>
            <h2 className="text-3xl font-bold text-gray-800">
              Events Near You
            </h2>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow max-w-xs">
            <div className="relative">
              <select
  value={selectedDistrict}
  onChange={(e) => setSelectedDistrict(e.target.value)}
  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
>
  <option value="">Select District</option>
  {divisions.map((division) => (
    <optgroup key={division} label={division}>
      {getDistrictsByDivision(division).map((district) => (
        <option key={district.id} value={district.name}>
          {district.name}
        </option>
      ))}
    </optgroup>
  ))}
</select>
              <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <FaLocationArrow className={`${locationLoading ? 'animate-spin' : ''}`} />
            {locationLoading ? 'Getting Location...' : 'Use My Location'}
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : localEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localEvents.map((event) => (
            <EventBox key={event.id} event={event} />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-12">
          <FaMapMarkerAlt className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No events in this area</h3>
          <p className="text-gray-500">
            There are currently no events scheduled in {selectedDistrict || 'your area'}.
          </p>
        </div>
      )}

      {/* View More Button */}
      {localEvents.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            View More Events in {selectedDistrict}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocalEvents;