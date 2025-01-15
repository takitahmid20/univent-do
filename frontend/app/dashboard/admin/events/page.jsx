// app/dashboard/admin/events/page.jsx
import EventsPageClient from '@/components/admin/events/EventsPageClient';

// Mock data
const events = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    organizer: {
      name: 'Sarah Wilson',
      organization: 'Tech Club BUET',
      avatar: 'https://placekitten.com/100/100'
    },
    university: 'BUET',
    date: '2024-03-15',
    time: '10:00 AM',
    status: 'upcoming',
    registrations: 156,
    image: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 2,
    title: 'Art Exhibition',
    organizer: {
      name: 'Michael Brown',
      organization: 'DU Art Society',
      avatar: 'https://placekitten.com/100/101'
    },
    university: 'University of Dhaka',
    date: '2024-03-20',
    time: '2:00 PM',
    status: 'active',
    registrations: 89,
    image: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 3,
    title: 'Business Seminar',
    organizer: {
      name: 'Emily Johnson',
      organization: 'CU Business Club',
      avatar: 'https://placekitten.com/100/102'
    },
    university: 'University of Chittagong',
    date: '2024-02-15',
    time: '11:00 AM',
    status: 'completed',
    registrations: 245,
    image: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  }
];

const stats = {
  totalEvents: 856,
  activeEvents: 142,
  upcomingEvents: 35,
  completedEvents: 679
};

export default function EventsPage() {
  return <EventsPageClient events={events} stats={stats} />;
}