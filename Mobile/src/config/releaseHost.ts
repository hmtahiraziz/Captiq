/**
 * Production API origin (scheme + host, no trailing slash, no `/api`).
 *
 * Set this before shipping a release build, e.g.:
 *   export const releaseApiHost = 'https://api.captiq.ai';
 *
 * Release builds fail startup if this is empty or still a placeholder.
 */
export const releaseApiHost = '';
