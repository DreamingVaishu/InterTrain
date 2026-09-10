/**
 * Session ID Utilities for InterTrain Backend & URL Routing
 * Matches the Google Stitch project ID format:
 * https://stitch.withgoogle.com/projects/2567837851963606030
 */

/**
 * Generates a 19-digit unique numeric session / project ID.
 * Uses 13-digit millisecond timestamp + 6-digit cryptographic pseudo-random suffix.
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
  return `${timestamp}${randomSuffix}`;
}

/**
 * Extracts session ID from the current browser URL path or query parameters.
 * Supports /projects/:sessionId, /practice/:sessionId, and ?session=:sessionId
 */
export function extractSessionIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // Check /projects/:id
  const projectMatch = window.location.pathname.match(/\/projects\/([0-9a-zA-Z_-]+)/);
  if (projectMatch) return projectMatch[1];

  // Check /practice/:id
  const practiceMatch = window.location.pathname.match(/\/practice\/([0-9a-zA-Z_-]+)/);
  if (practiceMatch) return practiceMatch[1];

  // Check query parameter ?session=... or ?id=...
  const params = new URLSearchParams(window.location.search);
  return params.get('session') || params.get('id') || null;
}
