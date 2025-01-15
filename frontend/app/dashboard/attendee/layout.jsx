import DashboardLayout from '../layouts/DashboardLayout';

export default function UserLayout({ children }) {
  return <DashboardLayout userRole="attendee">{children}</DashboardLayout>;
}