"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AttendeeDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is an attendee
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/signin');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.userType !== 'attendee') {
      router.push('/signin');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Attendee Dashboard</h1>
        
        {/* Events Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Upcoming Events Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
            <p className="text-4xl font-bold text-[#f6405f]">5</p>
            <p className="text-gray-600">Events you're registered for</p>
          </div>

          {/* Past Events Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Events</h2>
            <p className="text-4xl font-bold text-[#f6405f]">12</p>
            <p className="text-gray-600">Events you've attended</p>
          </div>

          {/* Certificates Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Certificates</h2>
            <p className="text-4xl font-bold text-[#f6405f]">8</p>
            <p className="text-gray-600">Earned certificates</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              <div className="p-4 hover:bg-gray-50">
                <p className="text-gray-800">Registered for "Web Development Workshop"</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
              <div className="p-4 hover:bg-gray-50">
                <p className="text-gray-800">Received certificate for "AI Fundamentals"</p>
                <p className="text-sm text-gray-500">Yesterday</p>
              </div>
              <div className="p-4 hover:bg-gray-50">
                <p className="text-gray-800">Attended "Startup Networking Event"</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Events Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommended Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Event Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">Machine Learning Workshop</h3>
                <p className="text-gray-600 text-sm mt-1">Dec 15, 2024 • 2:00 PM</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[#f6405f] font-semibold">Free</span>
                  <button className="px-4 py-2 bg-[#f6405f] text-white rounded-lg hover:bg-[#d63350] transition-colors">
                    Register
                  </button>
                </div>
              </div>
            </div>

            {/* More event cards can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeDashboard;
