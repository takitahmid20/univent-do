// app/events/[slug]/page.jsx
import { getEventBySlug } from '@/lib/data/eventData';
import EventDetails from '@/components/events/EventDetails';
import { notFound } from 'next/navigation';

export default async function EventPage({ params: { slug } }) {
  if (!slug) return notFound();

  const event = await getEventBySlug(slug);
  
  if (!event) return notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <EventDetails event={event} />
    </main>
  );
}