// components/HeroSection.jsx
"use client";
import React, { useState } from 'react';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { FaSearch } from 'react-icons/fa'; // Import search icon

const HeroSection = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const categories = [
    { value: 'Competition', label: 'Competition' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Seminar', label: 'Seminar' },
  ];

  return (
    <div className="relative min-h-[85vh] flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Find and join the most exciting events happening around you
          </p>

          {/* Search Section */}
<div className="max-w-3xl mx-auto">
  <div className="flex items-center bg-white rounded-2xl p-2 shadow-lg">
    {/* Search Input */}
    <div className="flex-grow px-4">
      <InputField
        type="text"
        placeholder="Search events by name or location..."
        value={search}
        onChange={handleSearchChange}
        className="w-full border-none focus:ring-0"
      />
    </div>

    {/* Divider */}
    <div className="h-8 w-px bg-gray-200 mx-2"></div>

    {/* Category Dropdown */}
    <div className="min-w-[140px] px-2">
      <Dropdown
        options={categories}
        value={category}
        onChange={handleCategoryChange}
        className="border-none focus:ring-0"
      />
    </div>

    {/* Search Button */}
    <button className="bg-[#18181B] p-4 rounded-xl ml-2">
      <FaSearch className="text-white text-xl" />
    </button>
  </div>
</div>

{/* Rest of your code... */}

          {/* Stats Section - With reduced spacing */}
          <div className="mt-8 flex justify-center items-center">
  {[
    { label: 'Active Events', value: '2,000+' },
    { label: 'Organizers', value: '500+' },
    { label: 'Categories', value: '50+' },
    { label: 'Monthly Users', value: '10K+' },
  ].map((stat, index) => (
    <div key={index} className="text-white px-4 mx-2"> {/* Reduced padding and margin */}
      <div className="text-2xl font-bold">{stat.value}</div>
      <div className="text-sm text-gray-300">{stat.label}</div>
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;