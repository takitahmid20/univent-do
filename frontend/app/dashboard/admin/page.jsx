"use client";

import { useState, useEffect } from 'react';
import {
  FaUsers,
  FaCalendarAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaChartLine
} from 'react-icons/fa';
import { API_ENDPOINTS } from '@/lib/config';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [attendeesRes, organizersRes] = await Promise.all([
        fetch(API_ENDPOINTS.ADMIN_LIST_ATTENDEES, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(API_ENDPOINTS.ADMIN_LIST_ORGANIZERS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!attendeesRes.ok || !organizersRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const [attendeesData, organizersData] = await Promise.all([
        attendeesRes.json(),
        organizersRes.json()
      ]);

      setStats({
        totalUsers: attendeesData.attendees.length,
        totalOrganizers: organizersData.organizers.length,
        totalEvents: 0, // You'll need to add an API endpoint for this
        revenue: 0 // You'll need to add an API endpoint for this
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaUsers className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaBuilding className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Organizers</h3>
              <p className="text-2xl font-bold">{stats.totalOrganizers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaCalendarAlt className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
              <p className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaMoneyBillWave className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
              <p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={() => window.location.href = '/dashboard/admin/users'} 
              className="w-full py-2 px-4 bg-[#f6405f] text-white rounded hover:bg-[#d93350] transition-colors"
            >
              Manage Users
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/admin/organizers'} 
              className="w-full py-2 px-4 bg-[#f6405f] text-white rounded hover:bg-[#d93350] transition-colors"
            >
              Manage Organizers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}