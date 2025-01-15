"use client";
import { useState } from 'react';
import {
  FaUsers,
  FaCalendarAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaChartLine
} from 'react-icons/fa';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaUsers className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <p className="text-2xl font-bold">12,345</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaBuilding className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Organizers</h3>
              <p className="text-2xl font-bold">234</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaCalendarAlt className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FaMoneyBillWave className="text-[#f6405f] w-8 h-8" />
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
              <p className="text-2xl font-bold">$123,456</p>
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
            {/* Add activity list */}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6">
            {/* Add quick action buttons */}
          </div>
        </div>
      </div>
    </div>
  );
}