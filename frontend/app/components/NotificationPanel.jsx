'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Set up refresh interval when panel is open
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching user notifications...');
      const response = await fetch(API_ENDPOINTS.USER_NOTIFICATIONS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Fetched notifications:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      // Sort notifications by date (newest first)
      const sortedNotifications = (data.notifications || []).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setNotifications(sortedNotifications);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Marking notification as read:', notificationId);
      const response = await fetch(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Marking all notifications as read');
      const response = await fetch(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } transition-transform duration-300 ease-in-out z-50`}>
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="relative">
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-6 bg-[#f6405f] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </span>
          </h2>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#f6405f] hover:text-[#d63850] font-medium"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6405f]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'border-[#f6405f] bg-pink-50 cursor-pointer' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            notification.type === 'important' ? 'bg-red-100 text-red-800' :
                            notification.type === 'update' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type}
                          </span>
                        </div>
                        {notification.event && (
                          <div className="text-sm text-[#f6405f] mb-1">
                            Event: {notification.event.title}
                          </div>
                        )}
                        <p className="text-gray-600">{notification.message}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <div className="flex flex-col">
                        <span>
                          {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                        </span>
                        {notification.sender && (
                          <span className="text-gray-400">
                            From: {notification.sender.username}
                          </span>
                        )}
                      </div>
                      {!notification.is_read && (
                        <span className="text-[#f6405f] font-medium">New</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No notifications yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}