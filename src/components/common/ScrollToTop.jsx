import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures the window scrolls to top (0, 0) whenever route or search parameters change,
 * unless a specific hash fragment is targeted.
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If there is an in-page hash and it's not the old #featured-root, attempt to scroll to it
    if (hash && hash !== '#featured-root') {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    // Clean up stale #featured-root from URL if present
    if (hash === '#featured-root') {
      window.history.replaceState(null, '', pathname + search);
    }
    // Reset scroll to top instantly
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash]);

  return null;
}
