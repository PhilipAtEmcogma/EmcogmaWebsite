/**
 * Contact Submissions Manager
 *
 * Manages contact form submissions with read/unread status.
 */

'use client';

import { CrudManager } from '@/lib/crud';
import { contactSubmissionsConfig } from './config/contactSubmissionsConfig';

export default function ContactSubmissionsManager() {
  return <CrudManager config={contactSubmissionsConfig} />;
}
