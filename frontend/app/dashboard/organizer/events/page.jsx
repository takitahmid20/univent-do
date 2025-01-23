'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';

import { FaBell } from 'react-icons/fa';
import NotificationModal from '@/app/components/NotificationModal';

export default function EventsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('grid');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/signin');
          return;
        }

        const response = await fetch(API_ENDPOINTS.ORGANIZER_EVENTS, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.events || []); 
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DELETE_EVENT(eventId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Remove the deleted event from state
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

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

  const EventCard = ({ event, onDelete }) => {
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative h-48 mb-4">
          <img
            src={event.image_url || '/default-event-image.jpg'}
            alt={event.title}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-event-image.jpg';
            }}
          />
          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm ${
            (event.publication_status || '').toLowerCase() === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {(event.publication_status || '').toLowerCase() === 'published' ? 'Published' : 'Draft'}
          </span>
          <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-sm ${
            !event.status ? 'bg-gray-100 text-gray-800'
            : event.status === 'upcoming'
              ? 'bg-blue-100 text-blue-800'
              : event.status === 'ongoing'
              ? 'bg-green-100 text-green-800'
              : event.status === 'completed'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {event.status 
              ? event.status.charAt(0).toUpperCase() + event.status.slice(1)
              : 'Unknown'}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
        <div className="text-gray-600 mb-2">
          <p>{formatDate(event.event_date)} at {formatTime(event.event_time)}</p>
          <p>{event.venue}</p>
          <p className="text-sm mt-1">
            Total Registrations: {event.registration_summary.total_registrations || 0}
            {event.max_attendees && ` / ${event.max_attendees}`}
          </p>
          <p className="text-sm">
            <span className="text-green-600">Approved: {event.registration_summary.approved_registrations}</span> • 
            <span className="text-yellow-600"> Pending: {event.registration_summary.pending_registrations}</span> • 
            <span className="text-red-600"> Rejected: {event.registration_summary.rejected_registrations}</span>
          </p>
          {event.registration_summary.total_revenue > 0 && (
            <p className="text-sm font-medium text-gray-900 mt-1">
              Revenue: ${event.registration_summary.total_revenue}
            </p>
          )}
        </div>
  
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#f6405f]">
              {event.ticket_price > 0 ? `$${event.ticket_price}` : 'Free'}
            </span>
            <div className="space-x-2">
              <Link 
                href={`/dashboard/organizer/events/edit/${event.id}`}
                className="text-blue-600 hover:text-blue-800 mr-4"
              >
                Edit
              </Link>
              <button 
                onClick={() => onDelete(event.id)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
  
          <div className="flex gap-2 mt-2">
            <Link 
              href={`/dashboard/organizer/attendees?eventId=${event.id}`}
              className="flex-1 text-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center justify-center"
            >
              <FaUsers className="mr-1" />
              View Attendees
            </Link>
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="flex-1 text-center px-3 py-2 bg-[#f6405f] text-white hover:bg-[#d63850] rounded text-sm flex items-center justify-center"
            >
              <FaBell className="mr-1" />
              Send Notification
            </button>
            
          </div>
        </div>
  
        {/* Notification Modal */}
        <NotificationModal
          eventId={event.id}
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f6405f]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#f6405f] text-white' : 'bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#f6405f] text-white' : 'bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => router.push('/dashboard/organizer/events/create')}
            className="bg-[#f6405f] text-white px-4 py-2 rounded-lg hover:bg-[#d63350] transition-colors"
          >
            Create Event
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onDelete={handleDelete} />
          ))}
          {events.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No events found. Create your first event!
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={event.image_url || '/default-event-image.jpg'} 
                        alt={event.title}
                        className="h-12 w-12 rounded object-cover mr-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-event-image.jpg';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.venue}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.publication_status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.publication_status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(event.event_date)}<br/>
                    {formatTime(event.event_time)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.registration_summary.total_registrations || 0}
                    {event.max_attendees && ` / ${event.max_attendees}`}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/dashboard/organizer/events/edit/${event.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                      <Link 
                        href={`/dashboard/organizer/attendees?eventId=${event.id}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        View Attendees
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events found. Create your first event!
            </div>
          )}
        </div>
      )}
    </div>
  );
}