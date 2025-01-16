'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/config';
import { 
  FaCalendarAlt, 
  FaUsers,
  FaUser, 
  FaMoneyBillWave, 
  FaClock,
  FaMapMarkerAlt,
  FaEllipsisH,
  FaSignOutAlt
} from 'react-icons/fa';

export default function OrganizerDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ORGANIZER_DASHBOARD, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    if (localStorage.getItem('token')) {
      fetchDashboardData();
    }
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f6405f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Events</p>
              <h3 className="text-2xl font-bold mt-1">{dashboardData?.total_events || 0}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="text-blue-600 w-6 h-6 flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Events</p>
              <h3 className="text-2xl font-bold mt-1">{dashboardData?.active_events || 0}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaClock className="text-green-600 w-6 h-6 flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Registrations</p>
              <h3 className="text-2xl font-bold mt-1">{dashboardData?.total_registrations || 0}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUsers className="text-purple-600 w-6 h-6 flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">৳{dashboardData?.total_revenue?.toFixed(2) || '0.00'}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-yellow-600 w-6 h-6 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <h2 className="text-xl font-bold">Upcoming Events</h2>
          <button
            onClick={() => router.push('/dashboard/organizer/create-event')}
            className="w-full sm:w-auto bg-[#f6405f] text-white px-4 py-2 rounded-lg hover:bg-[#d63350] transition-colors"
          >
            Create New Event
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {dashboardData?.upcoming_events?.map((event) => (
            <div key={event.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaClock className="mr-2 flex-shrink-0" />
                    <span className="truncate">{formatDate(event.event_date)} at {formatTime(event.event_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUser className="mr-2 flex-shrink-0" />
                    <span className="truncate">{event.registered_attendees} Registered</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[#f6405f] font-semibold">
                    ৳{event.ticket_price?.toFixed(2) || 'Free'}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <FaEllipsisH />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!dashboardData?.upcoming_events || dashboardData.upcoming_events.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No upcoming events. Create one now!
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-6 sm:mt-8">
        <h2 className="text-xl font-bold mb-6">Recent Registrations</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Event</th>
                <th className="text-left py-3">User</th>
                <th className="text-left py-3">Seats</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recent_registrations?.map((reg) => (
                <tr key={reg.registration_id} className="border-b">
                  <td className="py-3">{reg.event_title}</td>
                  <td className="py-3">{reg.username}</td>
                  <td className="py-3">{reg.number_of_seats}</td>
                  <td className="py-3">৳{reg.total_amount}</td>
                  <td className="py-3">{formatDate(reg.registration_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!dashboardData?.recent_registrations || dashboardData.recent_registrations.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No recent registrations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}