/**
 * SEO Utilities
 *
 * Helper functions for generating meta tags, structured data,
 * and managing SEO across the application
 */

// ============================================================================
// Types
// ============================================================================

export interface MetaTags {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface StructuredDataOrganization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    telephone?: string;
    contactType?: string;
    email?: string;
  };
}

export interface StructuredDataWebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

export interface StructuredDataBreadcrumb {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

// ============================================================================
// Meta Tag Generation
// ============================================================================

/**
 * generateMetaTags
 *
 * Generates complete meta tag configuration for react-helmet-async
 * Includes title, description, Open Graph, Twitter Card, and additional tags
 *
 * @param config - Meta tag configuration object
 * @returns MetaTags object ready for Helmet component
 *
 * @example
 * const meta = generateMetaTags({
 *   title: 'Premium Spanish Classes',
 *   description: 'Book Spanish lessons online',
 *   canonical: 'https://spanishclass.com/',
 *   ogImage: 'https://spanishclass.com/og-image.jpg',
 * });
 */
export function generateMetaTags(config: MetaTags): MetaTags {
  const {
    title,
    description,
    canonical,
    ogImage,
    ogUrl = canonical,
    ogType = "website",
    twitterCard = ogImage ? "summary_large_image" : "summary",
    keywords = [],
    noindex = false,
    nofollow = false,
  } = config;

  return {
    title,
    description,
    canonical,
    ogTitle: config.ogTitle || title,
    ogDescription: config.ogDescription || description,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    twitterTitle: config.twitterTitle || title,
    twitterDescription: config.twitterDescription || description,
    twitterImage: config.twitterImage || ogImage,
    keywords,
    author: config.author,
    publishedTime: config.publishedTime,
    modifiedTime: config.modifiedTime,
    noindex,
    nofollow,
  };
}

/**
 * formatTitle
 *
 * Formats page title with site name suffix
 *
 * @param pageTitle - Page-specific title
 * @param siteName - Site name (default: 'Spanish Class')
 * @returns Formatted title string
 *
 * @example
 * formatTitle('Dashboard') // => 'Dashboard | Spanish Class'
 * formatTitle('Spanish Class', '', true) // => 'Spanish Class'
 */
export function formatTitle(
  pageTitle: string,
  siteName: string = "Spanish Class",
  isHomePage: boolean = false,
): string {
  if (isHomePage) {
    return pageTitle;
  }
  return `${pageTitle} | ${siteName}`;
}

// ============================================================================
// Structured Data Generation
// ============================================================================

/**
 * generateOrganizationSchema
 *
 * Generates Organization structured data (schema.org)
 * Used for brand identity and rich search results
 *
 * @param config - Organization configuration
 * @returns StructuredDataOrganization object
 */
export function generateOrganizationSchema(config: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  telephone?: string;
  email?: string;
}): StructuredDataOrganization {
  const schema: StructuredDataOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.name,
    url: config.url,
  };

  if (config.logo) {
    schema.logo = config.logo;
  }

  if (config.sameAs) {
    schema.sameAs = config.sameAs;
  }

  if (config.telephone || config.email) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
    };
    if (config.telephone) schema.contactPoint.telephone = config.telephone;
    if (config.email) schema.contactPoint.email = config.email;
  }

  return schema;
}

/**
 * generateWebSiteSchema
 *
 * Generates WebSite structured data with search action
 * Enables sitelinks search box in Google results
 *
 * @param config - Website configuration
 * @returns StructuredDataWebSite object
 */
export function generateWebSiteSchema(config: {
  name: string;
  url: string;
  searchUrl?: string;
}): StructuredDataWebSite {
  const schema: StructuredDataWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: config.url,
  };

  if (config.searchUrl) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: `${config.searchUrl}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    };
  }

  return schema;
}

/**
 * generateBreadcrumbSchema
 *
 * Generates BreadcrumbList structured data
 * Displays breadcrumb navigation in search results
 *
 * @param breadcrumbs - Array of breadcrumb items
 * @returns StructuredDataBreadcrumb object
 *
 * @example
 * generateBreadcrumbSchema([
 *   { name: 'Home', url: 'https://example.com/' },
 *   { name: 'Lessons', url: 'https://example.com/lessons' },
 *   { name: 'Spanish 101' }, // Current page (no URL)
 * ])
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url?: string }>,
): StructuredDataBreadcrumb {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.url && { item: crumb.url }),
    })),
  };
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * generateCanonicalUrl
 *
 * Generates canonical URL for the current page
 * Ensures consistent URL format (trailing slash, https, etc.)
 *
 * @param path - Page path (e.g., '/dashboard')
 * @param baseUrl - Base URL (default: production URL)
 * @returns Canonical URL string
 */
export function generateCanonicalUrl(
  path: string,
  baseUrl: string = "https://spanishclass.com",
): string {
  // Remove trailing slash from base URL
  const cleanBase = baseUrl.replace(/\/$/, "");

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Remove trailing slash from path (except for root)
  const finalPath = cleanPath === "/" ? "/" : cleanPath.replace(/\/$/, "");

  return `${cleanBase}${finalPath}`;
}

/**
 * generateOgImageUrl
 *
 * Generates Open Graph image URL
 * Ensures absolute URL with proper dimensions
 *
 * @param imagePath - Image path or filename
 * @param baseUrl - Base URL (default: production URL)
 * @returns Absolute image URL
 */
export function generateOgImageUrl(
  imagePath: string,
  baseUrl: string = "https://spanishclass.com",
): string {
  // If already absolute URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Remove leading slash from image path
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  // Remove trailing slash from base URL
  const cleanBase = baseUrl.replace(/\/$/, "");

  return `${cleanBase}/${cleanPath}`;
}

// ============================================================================
// Robots Meta Tag Utilities
// ============================================================================

/**
 * generateRobotsTag
 *
 * Generates robots meta tag value
 * Controls search engine indexing and following
 *
 * @param noindex - Prevent indexing
 * @param nofollow - Prevent following links
 * @returns Robots meta tag value
 */
export function generateRobotsTag(
  noindex: boolean = false,
  nofollow: boolean = false,
): string {
  const directives: string[] = [];

  if (noindex) directives.push("noindex");
  else directives.push("index");

  if (nofollow) directives.push("nofollow");
  else directives.push("follow");

  return directives.join(", ");
}

// ============================================================================
// Course Structured Data
// ============================================================================

export interface StructuredDataCourse {
  "@context": "https://schema.org";
  "@type": "Course";
  name: string;
  description: string;
  provider: {
    "@type": "Organization";
    name: string;
    sameAs?: string;
  };
  offers?: {
    "@type": "Offer";
    category: string;
    price: string;
    priceCurrency: string;
  };
}

/**
 * generateCourseSchema
 *
 * Generates Course structured data for lesson cards
 * Displays rich results for individual lessons
 *
 * @param config - Course configuration
 * @returns StructuredDataCourse object
 */
export function generateCourseSchema(config: {
  name: string;
  description: string;
  provider?: string;
  price?: number;
  currency?: string;
}): StructuredDataCourse {
  const schema: StructuredDataCourse = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: config.name,
    description: config.description,
    provider: {
      "@type": "Organization",
      name: config.provider || "SpanishClass",
      sameAs: "https://spanishclass.com",
    },
  };

  if (config.price && config.currency) {
    schema.offers = {
      "@type": "Offer",
      category: "Paid",
      price: config.price.toString(),
      priceCurrency: config.currency,
    };
  }

  return schema;
}

// ============================================================================
// Review Structured Data
// ============================================================================

export interface StructuredDataReview {
  "@context": "https://schema.org";
  "@type": "Review";
  itemReviewed: {
    "@type": "Course" | "Organization";
    name: string;
  };
  reviewRating: {
    "@type": "Rating";
    ratingValue: number;
    bestRating?: number;
  };
  author: {
    "@type": "Person";
    name: string;
  };
  reviewBody?: string;
  datePublished?: string;
}

/**
 * generateReviewSchema
 *
 * Generates Review structured data for teacher ratings
 * Displays star ratings in search results
 *
 * @param config - Review configuration
 * @returns StructuredDataReview object
 */
export function generateReviewSchema(config: {
  itemName: string;
  itemType?: "Course" | "Organization";
  rating: number;
  bestRating?: number;
  authorName: string;
  reviewBody?: string;
  datePublished?: string;
}): StructuredDataReview {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": config.itemType || "Course",
      name: config.itemName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: config.rating,
      bestRating: config.bestRating || 5,
    },
    author: {
      "@type": "Person",
      name: config.authorName,
    },
    ...(config.reviewBody && { reviewBody: config.reviewBody }),
    ...(config.datePublished && { datePublished: config.datePublished }),
  };
}

// ============================================================================
// Default SEO Config
// ============================================================================

export const defaultSEO: MetaTags = {
  title: "Spanish Class - Premium Online Spanish Lessons",
  description:
    "Book premium Spanish lessons with certified teachers. Personalized 1-on-1 classes starting at 2000 RSD. Learn Spanish online at your own pace.",
  canonical: "https://spanishclass.com/",
  ogImage: "https://spanishclass.com/og-image.jpg",
  ogType: "website",
  twitterCard: "summary_large_image",
  keywords: [
    "spanish classes",
    "online spanish lessons",
    "learn spanish",
    "spanish teacher",
    "spanish tutoring",
  ],
};
