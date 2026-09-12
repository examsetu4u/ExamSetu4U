import { useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';

/**
 * Global ScrollToTop component.
 * Automatically resets the scroll position to the top of the page whenever
 * the route, path, search query, or browser history navigation changes.
 */
export function ScrollToTop() {
  const [location] = useLocation();
  const search = useSearch();

  useEffect(() => {
    // Prevent browser from trying to restore previous scroll position on popstate
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      // If there's an anchor hash target on the page, scroll to that element
      if (window.location.hash) {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView();
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    // Schedule in animation frame to ensure scroll is reset even after DOM rendering/hydration
    const frameId = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(frameId);
  }, [location, search]);

  useEffect(() => {
    const handlePopState = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin);
      if (isInternal) {
        const currentPath = window.location.pathname;
        const targetPath = href.split('?')[0].split('#')[0];
        if (targetPath === currentPath) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('click', handleLinkClick, { capture: true });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, []);

  return null;
}
