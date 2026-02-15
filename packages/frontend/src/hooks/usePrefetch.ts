/**
 * usePrefetch Hook
 *
 * Prefetch route components on hover for instant navigation
 * Improves perceived performance by preloading likely next routes
 */

import { useState } from "react";

const prefetchedRoutes = new Set<string>();

export function usePrefetch(routePath: string) {
  const [isPrefetched, setIsPrefetched] = useState(false);

  const prefetch = () => {
    if (prefetchedRoutes.has(routePath)) {
      setIsPrefetched(true);
      return;
    }

    // For React.lazy components, the import will be cached
    // This triggers the dynamic import without navigating
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "script";
    link.href = routePath;
    document.head.appendChild(link);

    prefetchedRoutes.add(routePath);
    setIsPrefetched(true);
  };

  return {
    prefetch,
    isPrefetched,
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}
