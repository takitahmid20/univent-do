"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  FaCalendarAlt,
  FaTicketAlt,
  FaUser,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSearch,
  FaChartBar,
  FaUsers,
  FaComments,
  FaRegBell,
  FaSpinner
} from 'react-icons/fa';

// Navigation for different roles
const navigationLinks = {
  attendee: [
    {
      title: 'Events',
      links: [
        { name: 'Dashboard', href: '/dashboard/attendee', icon: FaChartBar },
        { name: 'My Tickets', href: '/dashboard/attendee/tickets', icon: FaTicketAlt },
        // { name: 'Upcoming Events', href: '/dashboard/attendee/upcoming', icon: FaCalendarAlt },
        // { name: 'Event Groups', href: '/dashboard/attendee/groups', icon: FaUsers },
      ]
    },
    {
      title: 'Account',
      links: [
        // { name: 'Profile', href: '/dashboard/attendee/profile', icon: FaUser },
        // { name: 'Messages', href: '/dashboard/attendee/messages', icon: FaComments },
        { name: 'Settings', href: '/dashboard/attendee/settings', icon: FaCog },
        { 
          name: 'Sign Out', 
          href: '#', 
          icon: FaSignOutAlt,
          onClick: (router) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Cookies.remove('token');
            router.replace('/signin');
          }
        },
      ]
    }
  ],
  user: [
    {
      title: 'Events',
      links: [
        { name: 'Dashboard', href: '/dashboard/attendee', icon: FaChartBar },
        { name: 'My Tickets', href: '/dashboard/attendee/tickets', icon: FaTicketAlt },
        // { name: 'Upcoming Events', href: '/dashboard/attendee/upcoming', icon: FaCalendarAlt },
        // { name: 'Event Groups', href: '/dashboard/attendee/groups', icon: FaUsers },
      ]
    },
    {
      title: 'Account',
      links: [
        // { name: 'Profile', href: '/dashboard/attendee/profile', icon: FaUser },
        // { name: 'Messages', href: '/dashboard/attendee/messages', icon: FaComments },
        { name: 'Settings', href: '/dashboard/attendee/settings', icon: FaCog },
        { 
          name: 'Sign Out', 
          href: '#', 
          icon: FaSignOutAlt,
          onClick: (router) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Cookies.remove('token');
            router.replace('/signin');
          }
        },
      ]
    }
  ],
  organizer: [
    {
      title: 'Events',
      links: [
        { name: 'Dashboard', href: '/dashboard/organizer', icon: FaChartBar },
        { name: 'My Events', href: '/dashboard/organizer/events', icon: FaCalendarAlt },
        { name: 'Attendees', href: '/dashboard/organizer/attendees', icon: FaUsers },
      ]
    },
    {
      title: 'Management',
      links: [
        // { name: 'Messages', href: '/dashboard/organizer/messages', icon: FaComments },
        { name: 'Settings', href: '/dashboard/organizer/settings', icon: FaCog },
        { 
          name: 'Sign Out', 
          href: '#', 
          icon: FaSignOutAlt,
          onClick: (router) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Cookies.remove('token');
            router.replace('/signin');
          }
        },
      ]
    }
  ],
  admin: [
    {
      title: 'Overview',
      links: [
        { name: 'Dashboard', href: '/dashboard/admin', icon: FaChartBar },
        { name: 'Users', href: '/dashboard/admin/users', icon: FaUsers },
        { name: 'Organizers', href: '/dashboard/admin/organizers', icon: FaUsers },
        { name: 'Events', href: '/dashboard/admin/events', icon: FaCalendarAlt },
      ]
    },
    {
      title: 'Management',
      links: [
        { name: 'Settings', href: '/dashboard/admin/settings', icon: FaCog },
        { 
          name: 'Sign Out', 
          href: '#', 
          icon: FaSignOutAlt,
          onClick: (router) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Cookies.remove('token');
            router.replace('/signin');
          }
        },
      ]
    }
  ]
};

const DashboardLayout = ({ children, userRole = 'user' }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState(userRole);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        router.replace('/signin');
        return;
      }

      try {
        const userData = JSON.parse(user);
        const userType = userData.userType?.toLowerCase() || 'user';
        
        // Map attendee to correct role for navigation
        setCurrentRole(userType);
        setIsAuthenticated(true);
        setIsLoading(false);

      } catch (error) {
        console.error('Error parsing user data:', error);
        router.replace('/signin');
      }
    };

    checkAuth();
  }, [userRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-[#f6405f] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Get navigation links based on role, fallback to user if not found
  const navigationSections = navigationLinks[currentRole] || navigationLinks.user;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col bg-white border-r">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <h1 className="text-2xl font-bold text-[#f6405f]">Univent</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {navigationSections.map((section, index) => (
              <div key={index} className="mb-6">
                <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.name}>
                        {link.onClick ? (
                          <button
                            onClick={() => link.onClick(router)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Icon className="w-5 h-5" />
                            <span>{link.name}</span>
                          </button>
                        ) : (
                          <Link
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-gray-50 text-[#f6405f]' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{link.name}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4 ml-4">
            {/* Create Event button - only show for organizers */}
            {currentRole === 'organizer' && (
              <Link 
                href="/dashboard/organizer/create-event"
                className="flex items-center gap-2 px-4 py-2 bg-[#f6405f] text-white rounded-lg hover:bg-[#d63850] transition-colors"
              >
                <FaCalendarAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Create Event</span>
                <span className="sm:hidden">+</span>
              </Link>
            )}
            
            {/* Notifications */}
            <button className="relative p-2">
              <FaRegBell className="w-6 h-6 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;