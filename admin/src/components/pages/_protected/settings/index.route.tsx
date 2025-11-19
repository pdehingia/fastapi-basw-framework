/**
 * Settings Page Route
 * Platform settings and configuration
 */

import { createFileRoute } from '@tanstack/react-router';
import SettingsPage from './settingsPage';
import { z } from 'zod';

// Search parameters schema - all optional
const settingsSearchSchema = z.object({
  section: z.enum(['general', 'security', 'notifications', 'api']).optional().default('general'),
}).optional();

export const Route = createFileRoute('/_protected/settings/')({
  component: SettingsPage,
  
  // Validate search parameters  
  validateSearch: (search) => settingsSearchSchema.parse(search),
});