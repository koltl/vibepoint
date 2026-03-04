/**
 * Canonical base URL for the site. Used for metadata, sitemap, and robots.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://vibepoint.io).
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vibepoint.example.com";
