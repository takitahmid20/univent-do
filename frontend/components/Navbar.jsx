"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBell, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import Button from './Button';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUserRole(user.userType);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section (Logo) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <Image 
                src="/images/logo.svg" 
                alt="Logo" 
                width={120} 
                height={40}
                className="cursor-pointer"
              />
            </Link>
          </div>

          {/* Hamburger Menu */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-[#f6405f] focus:outline-none"
            >
              {isMenuOpen ? 
                <FaTimes size={24} className="h-6 w-6" /> : 
                <FaBars size={24} className="h-6 w-6" />
              }
            </button>
          </div>

          {/* Middle Section (Desktop Navigation) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[#f6405f] font-medium">
              Home
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-[#f6405f] font-medium">
              Events
            </Link>
            {isAuthenticated && userRole === 'organizer' && (
              <Link href="/dashboard/organizer" className="text-gray-700 hover:text-[#f6405f] font-medium">
                Dashboard
              </Link>
            )}
            {isAuthenticated && userRole === 'admin' && (
              <Link href="/dashboard/admin" className="text-gray-700 hover:text-[#f6405f] font-medium">
                Admin Panel
              </Link>
            )}
            {isAuthenticated && userRole === 'attendee' && (
              <Link href="/dashboard/attendee" className="text-gray-700 hover:text-[#f6405f] font-medium">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Section (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {userRole === 'organizer' && (
                    <Link 
                      href="/dashboard/organizer/create-event" 
                      className="text-gray-700 hover:text-[#f6405f] font-medium"
                    >
                      Create Event
                    </Link>
                  )}
                  <button className="text-gray-700 hover:text-[#f6405f]">
                    <FaBell size={20} />
                  </button>
                  <div className="relative group">
                    <button className="text-gray-700 hover:text-[#f6405f]">
                      <FaUserCircle size={24} />
                    </button>
                    <div className="absolute right-0 w-48 mt-2 py-1 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {userRole === 'organizer' && (
                        <Link 
                          href="/dashboard/organizer"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                      )}
                      {userRole === 'admin' && (
                        <Link 
                          href="/dashboard/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                      )}
                      {userRole === 'attendee' && (
                        <Link 
                          href="/dashboard/attendee"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/signin">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className="block px-3 py-2 text-gray-700 hover:text-[#f6405f] hover:bg-gray-50"
            >
              Home
            </Link>
            <Link 
              href="/events" 
              className="block px-3 py-2 text-gray-700 hover:text-[#f6405f] hover:bg-gray-50"
            >
              Events
            </Link>
            
            {!isLoading && (
              isAuthenticated ? (
                <>
                  {userRole === 'organizer' && (
                    <>
                      <Link 
                        href="/dashboard/organizer" 
                        className="block px-3 py-2 text-gray-700 hover:text-[#f6405f] hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/dashboard/organizer/create-event" 
                        className="block px-3 py-2 text-gray-700 hover:text-[#f6405f] hover:bg-gray-50"
                      >
                        Create Event
                      </Link>
                    </>
                  )}
                  {userRole === 'admin' && (
                    <Link 
                      href="/dashboard/admin" 
                      className="block px-3 py-2 text-gray-700 hover:text-[#f6405f] hover:bg-gray-50"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {userRole === 'attendee' && (
                    <Link 
                      href="/dashboard/attendee" 
                      className="block px-3 py-2 text-gray-700 hover:text-[#f6405f] hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#f6405f] hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/signin">
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;