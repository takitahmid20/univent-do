import DashboardLayout from '../layouts/DashboardLayout';

export default function AdminLayout({ children }) {
  return <DashboardLayout userRole="admin">{children}</DashboardLayout>;
}