import DashboardLayout from '../layouts/DashboardLayout';

export default function OrganizerLayout({ children }) {
  return <DashboardLayout userRole="organizer">{children}</DashboardLayout>;
}