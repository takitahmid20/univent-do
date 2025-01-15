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

// QR Code Modal Component
function QRCodeModal({ isOpen, onClose, qrCode, eventTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Event Check-in QR Code</h3>
          <p className="text-gray-500 mb-4">{eventTitle}</p>
          
          <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
            {qrCode ? (
              <img 
                src={qrCode} 
                alt="QR Code"
                className="mx-auto w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">QR Code not available</p>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            Show this QR code at the event entrance
          </p>
        </div>
      </div>
    </div>
  );
}

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

  // Check if registration is valid
  if (!registration) return null;

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
            <h3 className="text-2xl font-bold mb-4">{registration.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{formatDate(registration.event_date)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">{formatTime(registration.event_time)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Venue</div>
                  <div className="font-medium">{registration.venue}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                <FaChair className="text-sm" />
                {registration.number_of_seats} seats
              </span>
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                ৳{registration.total_amount}
              </span>
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