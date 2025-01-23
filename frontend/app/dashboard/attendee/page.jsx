'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import {
  FaCalendarAlt,
  FaHistory,
  FaMoneyBill,
  FaSignOutAlt,
  FaQrcode,
  FaDownload,
  FaChair,
  FaFileAlt
} from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';
import { jsPDF } from 'jspdf';

// QR Code Modal Component
function QRCodeModal({ isOpen, onClose, qrCode, eventTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <FaSignOutAlt className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Event QR Code
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          {eventTitle}
        </p>

        <div className="flex justify-center">
          {qrCode ? (
            <img
              src={qrCode}
              alt="Event QR Code"
              className="w-64 h-64"
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading QR code...</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 text-center">
            Show this QR code at the event entrance
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    total_events: 0,
    active_events: 0,
    total_spent: 0,
    upcoming_events: [],
    recent_registrations: []
  });
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedEventQR, setSelectedEventQR] = useState(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch both registrations and dashboard data
        const [registrationsResponse, dashboardResponse] = await Promise.all([
          fetch(API_ENDPOINTS.USER_REGISTERED_EVENTS, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch(API_ENDPOINTS.USER_DASHBOARD, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        if (!registrationsResponse.ok || !dashboardResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [registrationsData, dashboardData] = await Promise.all([
          registrationsResponse.json(),
          dashboardResponse.json()
        ]);

        console.log('Registration Data:', registrationsData); // For debugging

        // Ensure registrationsData is properly structured
        const eventsList = registrationsData?.registrations || [];
        setEvents(eventsList);
        setDashboardData(dashboardData);

      } catch (err) {
        console.error('Error:', err); // For debugging
        toast.error(err.message);
        setEvents([]); // Set empty array on error
        setDashboardData({
          total_events: 0,
          active_events: 0,
          total_spent: 0,
          upcoming_events: [],
          recent_registrations: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowQR = (registration) => {
    if (registration?.event?.title) {
      setSelectedEventTitle(registration.event.title);
      setSelectedEventQR(registration.qr_code);
      setShowQRCode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/signin');
  };

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

  const downloadTicket = async (ticket_pdf, eventTitle) => {
    try {
      // Convert base64 to blob
      const base64Response = ticket_pdf.split(',')[1];
      const binaryString = window.atob(base64Response);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Error downloading ticket. Please try again.');
    }
  };

  const generateEventPDF = (event) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(event.event.title, 20, 20);
    
    // Add event details
    doc.setFontSize(12);
    doc.text(`Date: ${formatDate(event.event.event_date)}`, 20, 40);
    doc.text(`Time: ${formatTime(event.event.event_time)}`, 20, 50);
    doc.text(`Venue: ${event.event.venue}`, 20, 60);
    doc.text(`Number of Seats: ${event.number_of_seats}`, 20, 70);
    doc.text(`Total Amount: ৳${event.total_amount}`, 20, 80);
    
    // Add QR Code if available
    if (event.qr_code) {
      doc.addImage(event.qr_code, 'PNG', 20, 100, 50, 50);
    }
    
    // Save the PDF
    doc.save(`${event.event.title}-ticket.pdf`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>;
  }

  // Split events into upcoming and past with proper null checks
  const currentDate = new Date();
  console.log('Current Date:', currentDate);
  console.log('Dashboard Data:', dashboardData);
  
  // Use upcoming events from dashboard data
  const upcomingEvents = dashboardData.upcoming_events.map(event => ({
    id: event.id,
    event: {
      title: event.title,
      event_date: event.event_date,
      event_time: event.event_time,
      venue: event.venue,
      ticket_price: event.total_amount / event.booked_seats, // Calculate per ticket price
    },
    number_of_seats: event.booked_seats,
    total_amount: event.total_amount,
    status: event.status,
    qr_code: event.qr_code,
    ticket_pdf: event.ticket_pdf,
    checked_in: event.checked_in,
    image_url: event.image_url
  }));
  
  // Keep the past events filtering as is
  const pastEvents = events.filter(registration => {
    const eventDate = registration?.event?.event_date ? new Date(registration.event.event_date) : null;
    return eventDate && eventDate < currentDate;
  });

  console.log('Upcoming Events:', upcomingEvents);
  console.log('Past Events:', pastEvents);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800"
        >
          <FaSignOutAlt className="w-5 h-5" />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Events</p>
              <p className="text-2xl font-bold">{dashboardData.total_events}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaHistory className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Active Events</p>
              <p className="text-2xl font-bold">{dashboardData.active_events}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaMoneyBill className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold">৳{dashboardData.total_spent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-1 gap-6">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-6">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.event.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaCalendarAlt className="text-gray-400 text-3xl" />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{event.event.title}</h3>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <FaCalendarAlt className="inline-block mr-2" />
                          {formatDate(event.event.event_date)} at {formatTime(event.event.event_time)}
                        </p>
                        <p className="text-gray-600">
                          <FaChair className="inline-block mr-2" />
                          {event.number_of_seats} seats
                        </p>
                        <p className="text-gray-600">
                          Total Amount: ৳{event.total_amount}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                            ${event.checked_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {event.checked_in ? 'Checked In' : 'Not Checked In'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {event.qr_code && (
                        <button
                          onClick={() => handleShowQR(event)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <FaQrcode className="w-5 h-5" />
                        </button>
                      )}
                      {event.ticket_pdf && (
                        <button
                          onClick={() => downloadTicket(event.ticket_pdf, event.event.title)}
                          className="text-green-600 hover:text-green-800 p-2"
                        >
                          <FaDownload className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => generateEventPDF(event)}
                        className="text-purple-600 hover:text-purple-800 p-2"
                        title="Generate PDF Ticket"
                      >
                        <FaFileAlt className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No upcoming events</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Events */}
      <div>
        <h2 className="text-xl font-bold mb-4">Past Events</h2>
        <div className="grid grid-cols-1 gap-6">
          {pastEvents.map((registration) => (
            <div key={registration.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{registration.event.title}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <FaCalendarAlt className="inline-block mr-2" />
                      {formatDate(registration.event.event_date)} at {formatTime(registration.event.event_time)}
                    </p>
                    <p className="text-gray-600">
                      <FaChair className="inline-block mr-2" />
                      {registration.number_of_seats} seats
                    </p>
                    <p className="text-gray-600">
                      Total Amount: ৳{registration.total_amount}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                        ${registration.checked_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {registration.checked_in ? 'Checked In' : 'Not Checked In'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {pastEvents.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No past events</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        qrCode={selectedEventQR}
        eventTitle={selectedEventTitle}
      />

      {/* Toast Container */}
      <Toaster position="bottom-right" />
    </div>
  );
}