// app/events/page.jsx
import Link from 'next/link';
import { getAllEvents } from '@/lib/data/eventData';

export default async function EventsPage() {
  const events = getAllEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link 
            key={event.id} 
            href={`/events/${event.slug}`}
            className="block group"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <span className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                  {event.category}
                </span>
                <h2 className="mt-2 text-xl font-semibold group-hover:text-[#f6405f]">
                  {event.title}
                </h2>
                <div className="mt-2 text-gray-600">
                  <p>{event.date}</p>
                  <p>{event.location}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}