'use client';

import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

// Sample user data
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+880 1234-567890',
  avatar: 'https://placekitten.com/200/200',
  university: 'Bangladesh University of Engineering & Technology',
  department: 'Computer Science & Engineering',
  joinedDate: 'January 2023',
  location: 'Dhaka, Bangladesh',
  stats: {
    eventsAttended: 12,
    upcomingEvents: 2
  }
};

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
            />

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-600 mt-1">{userData.department}</p>
              <p className="text-gray-500 text-sm mt-1">{userData.university}</p>

              {/* Stats */}
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <div className="text-center">
                  <div className="font-bold text-xl text-[#f6405f]">
                    {userData.stats.eventsAttended}
                  </div>
                  <div className="text-sm text-gray-500">Events Attended</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-[#f6405f]">
                    {userData.stats.upcomingEvents}
                  </div>
                  <div className="text-sm text-gray-500">Upcoming Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-gray-400" />
              <span>{userData.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-gray-400" />
              <span>{userData.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-gray-400" />
              <span>{userData.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-400" />
              <span>Joined {userData.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}