/**
 * SEOMeta Component
 *
 * Comprehensive SEO meta tags using react-helmet-async
 * Handles title, description, canonical, Open Graph, Twitter Cards
 */

import { Helmet } from 'react-helmet-async';

export interface SEOMetaProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export function SEOMeta({
  title,
  description,
  canonical,
  image = '/images/og/default.jpg',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords = [],
  noindex = false,
  nofollow = false,
}: SEOMetaProps) {
  const fullTitle = `${title} | SpanishClass`;
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  // Construct canonical URL
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://spanishclass.com';
  const canonicalUrl = canonical
    ? `${siteUrl}${canonical}`
    : typeof window !== 'undefined'
    ? window.location.href
    : siteUrl;

  // Construct image URL (handle relative paths)
  const imageUrl = image.startsWith('http')
    ? image
    : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="SpanishClass" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content="@spanishclass" />

      {/* Additional Meta Tags */}
      <meta name="author" content={author || 'SpanishClass'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
    </Helmet>
  );
}
