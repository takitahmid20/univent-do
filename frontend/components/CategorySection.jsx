// components/CategorySection.jsx
import React from 'react';
import { 
  FaMusic, 
  FaGraduationCap, 
  FaLaptopCode, 
  FaPalette, 
  FaBasketballBall, 
  FaBriefcase, 
  FaTheaterMasks, 
  FaUtensils 
} from 'react-icons/fa';
import Link from 'next/link';

const CategorySection = () => {
  const categories = [
    {
      id: 1,
      name: 'Music',
      icon: FaMusic,
      color: '#FF6B6B',
      count: 120,
    },
    {
      id: 2,
      name: 'Education',
      icon: FaGraduationCap,
      color: '#4ECDC4',
      count: 85,
    },
    {
      id: 3,
      name: 'Technology',
      icon: FaLaptopCode,
      color: '#45B7D1',
      count: 200,
    },
    {
      id: 4,
      name: 'Arts',
      icon: FaPalette,
      color: '#96CEB4',
      count: 75,
    },
    {
      id: 5,
      name: 'Sports',
      icon: FaBasketballBall,
      color: '#FF9F1C',
      count: 90,
    },
    {
      id: 6,
      name: 'Business',
      icon: FaBriefcase,
      color: '#6C5B7B',
      count: 150,
    },
    {
      id: 7,
      name: 'Entertainment',
      icon: FaTheaterMasks,
      color: '#F15BB5',
      count: 110,
    },
    {
      id: 8,
      name: 'Food & Drink',
      icon: FaUtensils,
      color: '#4CAF50',
      count: 95,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Browse by Category
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover events that match your interests. From music festivals to workshops, 
          find experiences that inspire you.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link 
              href={`/categories/${category.name.toLowerCase()}`} 
              key={category.id}
            >
              <div className="group relative bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    backgroundImage: `radial-gradient(circle at 10px 10px, ${category.color} 2px, transparent 0)`,
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Content */}
                <div className="relative flex flex-col items-center text-center">
                  {/* Icon Container */}
                  <div 
                    className="w-16 h-16 flex items-center justify-center rounded-full mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon 
                      className="text-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{ color: category.color }}
                    />
                  </div>

                  {/* Category Name */}
                  <h3 className="text-gray-800 font-semibold mb-2 group-hover:text-[#f6405f]">
                    {category.name}
                  </h3>

                  {/* Event Count */}
                  <span className="text-sm text-gray-500">
                    {category.count} Events
                  </span>

                  {/* Hover Indicator */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#f6405f] transition-all duration-300 group-hover:w-12" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="text-center mt-8">
        <Link 
          href="/categories" 
          className="inline-flex items-center text-[#f6405f] hover:text-[#d63850] font-medium"
        >
          View All Categories
          <svg 
            className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;