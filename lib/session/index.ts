/**
 * Session Management Module
 *
 * Centralized session validation, timeout tracking, and authorization logic
 * extracted from middleware for better testability and maintainability.
 */

export {
  validateSessionTimeout,
  validateSessionIP,
  updateSessionCookies,
  cleanupOAuthCallback,
  isOAuthCallback,
  SESSION_TIMEOUT_MS,
  type SessionValidationResult,
} from './validation';

export { authorizeAdminRoute, isActiveAdmin } from './authorization';
