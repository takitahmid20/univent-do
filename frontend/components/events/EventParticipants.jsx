'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';

const EventParticipants = ({ eventId }) => {
  const [participants, setParticipants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await fetch(API_ENDPOINTS.EVENT_PARTICIPANTS(eventId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch participants');
        }

        const data = await response.json();
        setParticipants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchParticipants();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!participants || !participants.participants) {
    return (
      <div className="p-4 text-gray-500">
        No participants data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Summary Section */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold">{participants.registrations_count}</p>
            <p className="text-sm text-gray-600">Total Registrations</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{participants.total_seats_booked}</p>
            <p className="text-sm text-gray-600">Seats Booked</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{participants.max_attendees}</p>
            <p className="text-sm text-gray-600">Maximum Seats</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{participants.available_seats}</p>
            <p className="text-sm text-gray-600">Available Seats</p>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.participants.map((participant) => (
              <tr key={participant.registration_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {participant.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {participant.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {participant.number_of_seats}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(participant.registration_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {participant.check_in_status ? (
                      <span className="flex items-center text-green-600">
                        <FaCheck className="mr-1" />
                        Checked In
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <FaClock className="mr-1" />
                        Not Checked In
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventParticipants;
