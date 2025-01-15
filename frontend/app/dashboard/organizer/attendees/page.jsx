'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaSpinner, FaFilter, FaSort, FaSearch, FaCheckCircle, FaUndoAlt, FaUser } from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';

const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function AttendeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [searchTerm, setSearchTerm] = useState('');
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    checkInStatus: 'all', // all, checked-in, not-checked-in
    startDate: '',
    endDate: '',
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: 'registration_date',
    direction: 'desc'
  });

  // Toggle sort
  const handleSort = (key) => {
    setSortConfig(prevSort => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Apply filters and sort
  useEffect(() => {
    let result = [...participants];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(participant => 
        participant.username.toLowerCase().includes(searchLower) ||
        participant.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply check-in status filter
    if (filters.checkInStatus !== 'all') {
      result = result.filter(participant => 
        filters.checkInStatus === 'checked-in' ? participant.check_in_status : !participant.check_in_status
      );
    }

    // Apply date range filter
    if (filters.startDate) {
      result = result.filter(participant => 
        new Date(participant.registration_date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      result = result.filter(participant => 
        new Date(participant.registration_date) <= new Date(filters.endDate)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date comparisons
      if (sortConfig.key === 'registration_date' || sortConfig.key === 'check_in_time') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredParticipants(result);
  }, [participants, searchTerm, filters, sortConfig]);

  const toggleCheckIn = async (registrationId) => {
    try {
      setCheckingIn(registrationId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.TOGGLE_CHECK_IN(registrationId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `application/json`,
        }
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Failed to toggle check-in status');
        } catch (e) {
          throw new Error(`Server error: ${responseText}`);
        }
      }

      try {
        const data = JSON.parse(responseText);
        // Update the participants list with the new check-in status
        setParticipants(participants.map(participant => 
          participant.registration_id === registrationId 
            ? {
                ...participant,
                check_in_status: data.check_in_status,
                check_in_time: data.check_in_time
              }
            : participant
        ));
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setCheckingIn(null);
    }
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) {
        setError('No event selected');
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/signin');
          return;
        }

        console.log('Fetching participants for event:', eventId);
        const response = await fetch(API_ENDPOINTS.EVENT_PARTICIPANTS(eventId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `application/json`,
          }
        });

        // Log the raw response for debugging
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.error || 'Failed to fetch participants');
          } catch (e) {
            throw new Error(`Server error: ${responseText}`);
          }
        }

        try {
          const data = JSON.parse(responseText);
          console.log('Parsed data:', data);

          if (typeof data === 'object' && data !== null) {
            setParticipants(data.participants || []);
            setEventDetails({
              totalSeatsBooked: data.total_seats_booked,
              maxAttendees: data.max_attendees,
              availableSeats: data.available_seats,
              registrationsCount: data.registrations_count
            });
          } else {
            throw new Error('Invalid response format');
          }
        } catch (e) {
          throw new Error('Invalid JSON response from server');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Event Statistics */}
      {eventDetails && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700">Total Registrations</h3>
            <p className="text-2xl font-bold text-blue-600">{eventDetails.registrationsCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-700">Total Seats Booked</h3>
            <p className="text-2xl font-bold text-green-600">{eventDetails.totalSeatsBooked}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-700">Available Seats</h3>
            <p className="text-2xl font-bold text-purple-600">
              {eventDetails.maxAttendees ? eventDetails.availableSeats : 'Unlimited'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <h3 className="text-sm font-semibold text-gray-700">Checked In</h3>
            <p className="text-2xl font-bold text-orange-600">
              {filteredParticipants.filter(p => p.check_in_status).length}
            </p>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filter Participants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Check-in Status Filter */}
          <div>
            <select
              value={filters.checkInStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, checkInStatus: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Attendees</option>
              <option value="checked-in">Checked In</option>
              <option value="not-checked-in">Not Checked In</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('username')}>
                  <div className="flex items-center gap-2">
                    Attendee
                    <FaSort className={sortConfig.key === 'username' ? 'text-blue-500' : 'text-gray-400'} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('number_of_seats')}>
                  <div className="flex items-center gap-2">
                    Seats
                    <FaSort className={sortConfig.key === 'number_of_seats' ? 'text-blue-500' : 'text-gray-400'} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('registration_date')}>
                  <div className="flex items-center gap-2">
                    Registration Date
                    <FaSort className={sortConfig.key === 'registration_date' ? 'text-blue-500' : 'text-gray-400'} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('check_in_time')}>
                  <div className="flex items-center gap-2">
                    Check-in Time
                    <FaSort className={sortConfig.key === 'check_in_time' ? 'text-blue-500' : 'text-gray-400'} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <FaSpinner className="animate-spin inline mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No participants found
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr key={participant.registration_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{participant.username}</span>
                        </div>
                        <div className="text-sm text-gray-500 ml-6">
                          {participant.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.number_of_seats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(participant.registration_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(participant.check_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleCheckIn(participant.registration_id)}
                        disabled={checkingIn === participant.registration_id}
                        className={`${
                          participant.check_in_status
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2`}
                      >
                        {checkingIn === participant.registration_id ? (
                          <FaSpinner className="animate-spin" />
                        ) : participant.check_in_status ? (
                          <FaUndoAlt />
                        ) : (
                          <FaCheckCircle />
                        )}
                        {participant.check_in_status ? 'Revert Check-in' : 'Check In'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}