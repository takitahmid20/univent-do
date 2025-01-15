"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarPlus, FaUsers, FaCertificate, FaChartLine } from 'react-icons/fa';

const OrganizerDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is an organizer
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/signin');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.userType !== 'organizer') {
      router.push('/signin');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Organizer Dashboard</h1>
          <button 
            className="px-6 py-2 bg-[#f6405f] text-white rounded-lg hover:bg-[#d63350] transition-colors flex items-center gap-2"
            onClick={() => router.push('/organizer/events/create')}
          >
            <FaCalendarPlus />
            Create Event
          </button>
        </div>
        
        {/* Stats Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Events Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 rounded-full">
                <FaCalendarPlus className="text-[#f6405f] text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600">Total Events</h2>
                <p className="text-2xl font-bold text-gray-800">15</p>
              </div>
            </div>
          </div>

          {/* Total Attendees Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600">Total Attendees</h2>
                <p className="text-2xl font-bold text-gray-800">342</p>
              </div>
            </div>
          </div>

          {/* Certificates Issued Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCertificate className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600">Certificates Issued</h2>
                <p className="text-2xl font-bold text-gray-800">156</p>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600">Revenue</h2>
                <p className="text-2xl font-bold text-gray-800">$2,450</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Web Development Workshop</div>
                    <div className="text-sm text-gray-500">Online</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Dec 15, 2024</div>
                    <div className="text-sm text-gray-500">2:00 PM</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">45/50</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[#f6405f] hover:text-[#d63350]">Edit</button>
                  </td>
                </tr>
                {/* More rows can be added here */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              <div className="p-4 hover:bg-gray-50">
                <p className="text-gray-800">New registration for "Web Development Workshop"</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
              <div className="p-4 hover:bg-gray-50">
                <p className="text-gray-800">Updated details for "AI Fundamentals Course"</p>
                <p className="text-sm text-gray-500">Yesterday</p>
              </div>
              <div className="p-4 hover:bg-gray-50">
                <p className="text-gray-800">Certificates issued for "Startup Networking Event"</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
