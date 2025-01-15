// app/events/[slug]/page.jsx
import EventDetails from '@/components/events/EventDetails';
import { notFound } from 'next/navigation';

const getEventBySlug = async (slug) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/public/${slug}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

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