// components/admin/SearchFilter.jsx
'use client';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchFilter() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div className="col-span-1 lg:col-span-2">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
          />
        </div>
      </div>

      {/* Filter Dropdown */}
      <div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Add User Button */}
      <div>
        <button className="w-full px-4 py-2 bg-[#f6405f] text-white rounded-lg hover:bg-[#d63850]">
          Add New User
        </button>
      </div>
    </div>
  );
}