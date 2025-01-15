// app/page.js (for Next.js 13+)
import HeroSection from '@/components/HeroSection';
import EventList from '@/components/EventList';
import CategorySection from '@/components/CategorySection';
import FeaturedOrganizers from '@/components/FeaturedOrganizers';
import LocalEvents from '@/components/LocalEvents';

export default function HomePage() {
  return (
    <div>
      
      <HeroSection />
      <div className="mx-[0px] sm:mx-[60px]">
      {/* <LocalEvents /> */}
      <EventList />
      <CategorySection />
      <FeaturedOrganizers />

      </div>
      
      
    </div>
  );
}
