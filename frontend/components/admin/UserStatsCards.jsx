// components/admin/UserStatsCards.jsx
import { FaUser, FaUserTag, FaCalendar, FaBan } from 'react-icons/fa';

export default function UserStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaUser className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <FaUserTag className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <FaCalendar className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">New This Month</p>
            <p className="text-2xl font-bold">{stats.newUsers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <FaBan className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Banned Users</p>
            <p className="text-2xl font-bold">{stats.bannedUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}