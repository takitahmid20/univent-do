// app/events/[slug]/page.jsx
import EventDetails from '@/components/events/EventDetails';
import { notFound } from 'next/navigation';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/config';

const getEventBySlug = async (slug) => {
  try {
    console.log('Fetching event with slug:', slug);
    const response = await fetch(API_ENDPOINTS.GET_PUBLIC_EVENT(slug));
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.error || 'Failed to fetch event');
    }
    
    const data = await response.json();
    console.log('Event data received:', data);
    return data;
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
    <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
      <EventDetails event={event} API_BASE_URL={API_BASE_URL} />
    </main>
  );
}