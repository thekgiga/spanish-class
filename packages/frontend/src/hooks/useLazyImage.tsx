/**
 * useLazyImage Hook
 *
 * Progressive image loading using Intersection Observer
 * Loads images only when they enter the viewport
 */

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { cn } from '@/lib/utils';

export interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useLazyImage(options: UseLazyImageOptions = {}) {
  const { threshold = 0.01, rootMargin = '50px' } = options;
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // If IntersectionObserver is not supported, load immediately
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(img);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(img);

    return () => {
      if (img) observer.unobserve(img);
    };
  }, [threshold, rootMargin]);

  return {
    imgRef,
    isInView,
    isLoaded,
    setIsLoaded,
  };
}

/**
 * LazyImage Component
 * Pre-built component using the hook
 */
export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
}

export function LazyImage({ src, alt, placeholderSrc, className, ...props }: LazyImageProps) {
  const { imgRef, isInView, isLoaded, setIsLoaded } = useLazyImage();

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholderSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  );
}
