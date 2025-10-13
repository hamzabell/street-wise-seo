import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a URL by adding protocol if missing and cleaning up format
 * Supports both www.example.com and https://www.example.com formats
 */
export function normalizeUrl(url: string): string {
  // Remove whitespace
  url = url.trim();

  // If no protocol, add https://
  if (!url.match(/^https?:\/\//)) {
    url = `https://${url}`;
  }

  // Remove trailing slash for consistency (but keep if it's just the domain)
  if (url.length > 8 && url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
}

/**
 * Feature flag utilities
 */
export const FEATURE_FLAGS = {
  PERFORMANCE_FEATURE: process.env.PERFORMANCE_FEATURE_ENABLED === 'true',
} as const;

export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] || false;
}
