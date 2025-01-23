'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaBell } from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';
import { toast } from 'react-hot-toast';

export default function NotificationModal({ eventId, isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchNotifications();
    }
  }, [isOpen, eventId]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.EVENT_NOTIFICATIONS(eventId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.SEND_EVENT_NOTIFICATION(eventId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotification),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send notification');
      }

      // Clear form and refresh notifications
      setNewNotification({
        title: '',
        message: '',
        type: 'general'
      });
      fetchNotifications();
      toast.success('Notification sent successfully');
      
      // Trigger notification update
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaBell className="mr-2" /> Event Notifications
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* New Notification Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Title
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f6405f] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({
                  ...prev,
                  message: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f6405f] focus:border-transparent"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newNotification.type}
                onChange={(e) => setNewNotification(prev => ({
                  ...prev,
                  type: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f6405f] focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="important">Important</option>
                <option value="update">Update</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full bg-[#f6405f] text-white py-2 px-4 rounded-lg hover:bg-[#d63350] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <FaBell className="animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send Notification'
            )}
          </button>
        </form>

        {/* Previous Notifications */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Previous Messages</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'border-[#f6405f] bg-pink-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      notification.type === 'important' ? 'bg-red-100 text-red-800' :
                      notification.type === 'update' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <span>
                      From: {notification.sender_name || notification.sender_email || 'System'}
                    </span>
                    <span>
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8 border rounded-lg">
                No messages sent yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}