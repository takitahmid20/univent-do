// components/admin/events/EventsPageClient.jsx
'use client';
import { FaCalendarAlt, FaCalendarCheck, FaCalendarPlus, FaCalendarTimes, FaEllipsisV, FaUsers } from 'react-icons/fa';
import PageHeader from '@/components/shared/PageHeader';
import SearchFilterBar from '@/components/shared/SearchFilterBar';
import StatsCard from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable';

export default function EventsPageClient({ events, stats }) {
  const filterOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Event',
      render: (item) => (
        <div className="flex items-center">
          <img
            src={item.image}
            alt={item.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="ml-4">
            <div className="font-medium text-gray-900">{item.title}</div>
            <div className="text-sm text-gray-500">
              {item.date} at {item.time}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Organizer',
      render: (item) => (
        <div className="flex items-center">
          <img
            src={item.organizer.avatar}
            alt={item.organizer.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="ml-3">
            <div className="text-sm font-medium">{item.organizer.name}</div>
            <div className="text-sm text-gray-500">{item.organizer.organization}</div>
          </div>
        </div>
      )
    },
    {
      header: 'University',
      field: 'university'
    },
    {
      header: 'Registrations',
      render: (item) => (
        <div className="flex items-center gap-2">
          <FaUsers className="text-gray-400" />
          <span>{item.registrations}</span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(item.status)}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
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
        title="Events Management"
        description="Monitor and manage all events"
      />

      <SearchFilterBar
        searchPlaceholder="Search events..."
        filterOptions={filterOptions}
        addButtonText="Add Event"
        onSearch={handleSearch}
        onFilter={handleFilter}
        onAdd={handleAdd}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={FaCalendarAlt}
          title="Total Events"
          value={stats.totalEvents}
          bgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        <StatsCard
          icon={FaCalendarCheck}
          title="Active Events"
          value={stats.activeEvents}
          bgColor="bg-green-100"
          iconColor="text-green-500"
        />
        <StatsCard
          icon={FaCalendarPlus}
          title="Upcoming Events"
          value={stats.upcomingEvents}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-500"
        />
        <StatsCard
          icon={FaCalendarTimes}
          title="Completed Events"
          value={stats.completedEvents}
          bgColor="bg-gray-100"
          iconColor="text-gray-500"
        />
      </div>

      <DataTable 
        columns={columns}
        data={events}
        rowActions={rowActions}
      />
    </div>
  );
}