/**
 * ResponsiveImage Component
 * 
 * Optimized responsive image with srcset and lazy loading
 * Supports WebP with fallback to JPEG/PNG
 */

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  widths?: number[]; // e.g., [400, 800, 1200]
  sizes?: string; // e.g., "(max-width: 640px) 100vw, 800px"
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  priority?: boolean; // Skip lazy loading for above-fold images
}

const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(
  (
    {
      src,
      alt,
      widths = [400, 800, 1200],
      sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
      aspectRatio = 'auto',
      objectFit = 'cover',
      priority = false,
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Generate srcset from base src
    const generateSrcSet = (baseSrc: string, widths: number[]) => {
      const ext = baseSrc.split('.').pop();
      const baseWithoutExt = baseSrc.replace(`.${ext}`, '');
      
      return widths
        .map((width) => `${baseWithoutExt}-${width}w.${ext} ${width}w`)
        .join(', ');
    };

    // Aspect ratio classes
    const aspectRatioClasses = {
      '16/9': 'aspect-video',
      '4/3': 'aspect-4/3',
      '1/1': 'aspect-square',
      auto: '',
    };

    // Object fit classes
    const objectFitClasses = {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
    };

    return (
      <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio])}>
        {/* Loading placeholder */}
        {!isLoaded && !imageError && (
          <div className="absolute inset-0 bg-spanish-cream-100 animate-pulse" />
        )}

        {/* Image */}
        {!imageError ? (
          <img
            ref={ref}
            src={src}
            srcSet={generateSrcSet(src, widths)}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full',
              objectFitClasses[objectFit],
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            {...props}
          />
        ) : (
          // Error fallback
          <div className="absolute inset-0 flex items-center justify-center bg-spanish-cream-100">
            <svg
              className="w-12 h-12 text-spanish-cream-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

ResponsiveImage.displayName = 'ResponsiveImage';

export { ResponsiveImage };
