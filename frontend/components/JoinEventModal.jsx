// components/JoinEventModal.jsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes } from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';

const JoinEventModal = ({ isOpen, onClose, event }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    number_of_seats: 1,
    dietary_requirements: '',
    t_shirt_size: '',
    additional_info: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.REGISTER_FOR_EVENT(event.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onClose();
        if (event.ticketPrice > 0) {
          router.push(`/payment/${data.registration_id}`);
        } else {
          alert('Registration successful! Check your dashboard for the ticket.');
          router.push('/dashboard/attendee/tickets');
        }
      } else {
        alert(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          {/* Modal Content */}
          <div className="mt-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Register for Event</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Number of Seats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <input
                  type="number"
                  value={1}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="mt-1 text-sm text-gray-500">Currently limited to 1 seat per registration</p>
              </div>

              {/* Dietary Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Requirements (Optional)
                </label>
                <input
                  type="text"
                  value={formData.dietary_requirements}
                  onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Any dietary restrictions?"
                />
              </div>

              {/* T-Shirt Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  T-Shirt Size (Optional)
                </label>
                <select
                  value={formData.t_shirt_size}
                  onChange={(e) => setFormData({ ...formData, t_shirt_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select size</option>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="XL">X-Large</option>
                  <option value="XXL">XX-Large</option>
                </select>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information (Optional)
                </label>
                <textarea
                  value={formData.additional_info}
                  onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Any additional information?"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#f6405f] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#d63850] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : (event.ticketPrice > 0 ? 'Proceed to Payment' : 'Complete Registration')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinEventModal;