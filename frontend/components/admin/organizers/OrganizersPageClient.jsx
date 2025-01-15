// components/admin/organizers/OrganizersPageClient.jsx
'use client';
import { FaUsers, FaCalendarAlt, FaChartBar, FaMoneyBillWave, FaEllipsisV } from 'react-icons/fa';
import PageHeader from '@/components/shared/PageHeader';
import SearchFilterBar from '@/components/shared/SearchFilterBar';
import StatsCard from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable';

export default function OrganizersPageClient({ organizers, stats }) {
  const filterOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' }
  ];

  const columns = [
    {
      header: 'Organizer',
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
      header: 'Organization',
      field: 'organization'
    },
    {
      header: 'University',
      field: 'university'
    },
    {
      header: 'Events',
      render: (item) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <span>{item.totalEvents} events</span>
          </div>
          <div className="text-gray-500">{item.activeEvents} active</div>
        </div>
      )
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
    },
    {
      header: 'Revenue',
      render: (item) => (
        <div className="text-sm text-gray-900">
          ৳{item.totalRevenue.toLocaleString()}
        </div>
      )
    }
  ];

  const rowActions = (item) => (
    <div className="flex items-center justify-end space-x-2">
      <button className="text-[#f6405f] hover:text-[#d63850]">
        View Details
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
        title="Organizers Management"
        description="Manage and monitor event organizers"
      />

      <SearchFilterBar
        searchPlaceholder="Search organizers..."
        filterOptions={filterOptions}
        addButtonText="Add Organizer"
        onSearch={handleSearch}
        onFilter={handleFilter}
        onAdd={handleAdd}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={FaUsers}
          title="Total Organizers"
          value={stats.totalOrganizers}
          bgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        <StatsCard
          icon={FaCalendarAlt}
          title="Total Events"
          value={stats.totalEvents}
          bgColor="bg-green-100"
          iconColor="text-green-500"
        />
        <StatsCard
          icon={FaChartBar}
          title="Active Organizers"
          value={stats.activeOrganizers}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-500"
        />
        <StatsCard
          icon={FaMoneyBillWave}
          title="Total Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          bgColor="bg-purple-100"
          iconColor="text-purple-500"
        />
      </div>

      <DataTable 
        columns={columns}
        data={organizers}
        rowActions={rowActions}
      />
    </div>
  );
}