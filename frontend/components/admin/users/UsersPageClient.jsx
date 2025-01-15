// components/admin/users/UsersPageClient.jsx
'use client';
import { FaUser, FaUserCheck, FaUserPlus, FaBan, FaEllipsisV } from 'react-icons/fa';
import PageHeader from '@/components/shared/PageHeader';
import SearchFilterBar from '@/components/shared/SearchFilterBar';
import StatsCard from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable';

export default function UsersPageClient({ users, stats }) {
  const filterOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'banned', label: 'Banned' }
  ];

  const columns = [
    {
      header: 'User',
      field: 'name',
      render: (item) => (
        <div className="flex items-center">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-4">
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'University',
      field: 'university'
    },
    {
      header: 'Status',
      render: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      )
    }
  ];

  const rowActions = (item) => (
    <div className="flex items-center justify-end space-x-2">
      <button className="text-[#f6405f] hover:text-[#d63850]">
        View Profile
      </button>
      <button className="text-gray-500 hover:text-gray-700">
        <FaEllipsisV />
      </button>
    </div>
  );

  const handleSearch = (query) => {
    console.log('Search:', query);
  };

  const handleFilter = (filter) => {
    console.log('Filter:', filter);
  };

  const handleAdd = () => {
    console.log('Add clicked');
  };

  return (
    <div>
      <PageHeader 
        title="Users Management"
        description="Manage and monitor user accounts"
      />

      <SearchFilterBar
        searchPlaceholder="Search users..."
        filterOptions={filterOptions}
        addButtonText="Add User"
        onSearch={handleSearch}
        onFilter={handleFilter}
        onAdd={handleAdd}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={FaUser}
          title="Total Users"
          value={stats.totalUsers}
          bgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        <StatsCard
          icon={FaUserCheck}
          title="Active Users"
          value={stats.activeUsers}
          bgColor="bg-green-100"
          iconColor="text-green-500"
        />
        <StatsCard
          icon={FaUserPlus}
          title="New Users"
          value={stats.newUsers}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-500"
        />
        <StatsCard
          icon={FaBan}
          title="Banned Users"
          value={stats.bannedUsers}
          bgColor="bg-red-100"
          iconColor="text-red-500"
        />
      </div>

      <DataTable 
        columns={columns}
        data={users}
        rowActions={rowActions}
      />
    </div>
  );
}