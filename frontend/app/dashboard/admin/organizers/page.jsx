// app/dashboard/admin/organizers/page.jsx
import OrganizersPageClient from '@/components/admin/organizers/OrganizersPageClient';

// Mock data
const organizers = [
  {
    id: 1,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@university.edu',
    organization: 'Tech Club BUET',
    university: 'BUET',
    totalEvents: 15,
    activeEvents: 3,
    totalRevenue: 150000,
    status: 'active',
    joinDate: '2024-01-15',
    avatar: 'https://placekitten.com/100/100'
  },
  {
    id: 2,
    name: 'Michael Brown',
    email: 'michael.b@du.edu',
    organization: 'DU Drama Society',
    university: 'University of Dhaka',
    totalEvents: 8,
    activeEvents: 2,
    totalRevenue: 75000,
    status: 'active',
    joinDate: '2024-02-01',
    avatar: 'https://placekitten.com/100/101'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    email: 'emily.j@cu.edu',
    organization: 'CU Sports Club',
    university: 'University of Chittagong',
    totalEvents: 12,
    activeEvents: 1,
    totalRevenue: 95000,
    status: 'inactive',
    joinDate: '2024-01-20',
    avatar: 'https://placekitten.com/100/102'
  }
];

const stats = {
  totalOrganizers: 185,
  activeOrganizers: 142,
  totalEvents: 856,
  totalRevenue: 2500000
};

export default function OrganizersPage() {
  return <OrganizersPageClient organizers={organizers} stats={stats} />;
}