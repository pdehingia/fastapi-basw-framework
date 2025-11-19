/**
 * User List Page Route
 * User management list with search and filters
 */

import { createFileRoute } from '@tanstack/react-router';
import UserListPage from './userListPage';
import { z } from 'zod';

// Search parameters schema - all optional
const usersSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  role: z.enum(['admin', 'customer', 'manager', 'provider']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
}).optional();

export const Route = createFileRoute('/_protected/users/')({
  component: UserListPage,
  
  // Validate search parameters
  validateSearch: (search) => usersSearchSchema.parse(search),
});