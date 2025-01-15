// components/shared/SearchFilterBar.jsx
'use client';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchFilterBar({ 
  searchPlaceholder = "Search...",
  filterOptions = [],
  addButtonText,
  onSearch,
  onFilter,
  onAdd
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
    onFilter?.(e.target.value);
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div className="col-span-1 lg:col-span-2">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
          />
        </div>
      </div>

      {/* Filter Dropdown */}
      {filterOptions.length > 0 && (
        <div>
          <select
            value={selectedFilter}
            onChange={handleFilterChange}
            className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f6405f]"
          >
            <option value="all">All</option>
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add Button */}
      {addButtonText && (
        <div>
          <button 
            onClick={onAdd}
            className="w-full px-4 py-2 bg-[#f6405f] text-white rounded-lg hover:bg-[#d63850]"
          >
            {addButtonText}
          </button>
        </div>
      )}
    </div>
  );
}