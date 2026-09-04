import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackToTop } from '../components/layout/BackToTop';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCarousel } from '../components/home/FeaturedCarousel';
import { QuizPromoCard } from '../components/home/QuizPromoCard';
import { SectionGrid } from '../components/home/SectionGrid';

export function HomePage() {
  useEffect(() => {
    document.title = 'Blog Tech — Chia sẻ kiến thức lập trình';
  }, []);

  return (
    <div className="app-container min-h-screen flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="landing-wrapper w-full max-w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 flex-1">
        <HeroSection />
        <FeaturedCarousel />
        <QuizPromoCard />
        <SectionGrid />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
