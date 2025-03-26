"use client";
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  FaDownload,
  FaQrcode,
  FaTimes,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaChair,
  FaCheckCircle,
  FaRegCircle
} from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';

// Ticket Card Component
function TicketCard({ registration }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check if registration and event are valid
  if (!registration || !registration.event) return null;

  const event = registration.event;

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-md">
      {/* Ticket stub design */}
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-[#f6405f]"></div>
      
      {/* Main ticket content */}
      <div className="ml-8 p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <FaTicketAlt className="text-[#f6405f]" />
              <span className="text-sm text-gray-500">Event Ticket</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">{event.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{formatDate(event.event_date)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">{formatTime(event.event_time)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Venue</div>
                  <div className="font-medium">{event.venue}</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              <div className="mb-2">
                <span className="font-medium">Address:</span> {event.address}
              </div>
              <div>
                <span className="font-medium">Organizer:</span> {event.organizer.organization_name || event.organizer.username}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {registration.checked_in ? (
                <div className="flex items-center text-green-500">
                  <FaCheckCircle className="mr-2" />
                  <span>Checked In</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <FaRegCircle className="mr-2" />
                  <span>Not Checked In</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center">
            {registration.qr_code ? (
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <img 
                  src={registration.qr_code} 
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
            ) : (
              <div className="bg-gray-100 p-2 rounded-lg w-32 h-32 flex items-center justify-center">
                <span className="text-gray-400 text-sm text-center">QR Code<br/>Not Available</span>
              </div>
            )}
            <span className="text-xs text-gray-500 mt-2">Scan for entry</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function TicketsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(API_ENDPOINTS.USER_REGISTERED_EVENTS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch registrations');
        }

        const data = await response.json();
        setRegistrations(data.registrations || []);
      } catch (error) {
        toast.error('Failed to load tickets');
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f6405f]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Tickets</h1>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 gap-6">
        {registrations.map((registration) => (
          <TicketCard 
            key={registration.registration_id}
            registration={registration}
          />
        ))}
      </div>

      {registrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No tickets found</div>
        </div>
      )}

      {/* Toast Container */}
      <Toaster position="bottom-right" />
    </div>
  );
}