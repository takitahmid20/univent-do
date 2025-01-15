// app/dashboard/admin/users/page.jsx
import UsersPageClient from '@/components/admin/users/UsersPageClient';

// Mock data
const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@university.edu',
    university: 'University of Dhaka',
    joinDate: '2024-01-15',
    status: 'active',
    avatar: 'https://placekitten.com/100/100'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    university: 'BUET',
    joinDate: '2024-02-01',
    status: 'active',
    avatar: 'https://placekitten.com/100/101'
  },
  {
    id: 3,
    name: 'Alex Johnson',
    email: 'alex.j@cu.edu',
    university: 'University of Chittagong',
    joinDate: '2024-01-20',
    status: 'inactive',
    avatar: 'https://placekitten.com/100/102'
  }
];

const stats = {
  totalUsers: 2453,
  activeUsers: 2128,
  newUsers: 128,
  bannedUsers: 23
};

export default function UsersPage() {
  return <UsersPageClient users={users} stats={stats} />;
}