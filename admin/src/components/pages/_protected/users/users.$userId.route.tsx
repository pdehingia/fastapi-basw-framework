/**
 * User Detail Page Route
 * Individual user details and management
 */

import { createFileRoute } from '@tanstack/react-router';
import UserDetailPage from './userDetailPage';
import { z } from 'zod';

// Parameter validation schema
const userParamsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Search parameters schema - all optional
const userSearchSchema = z.object({
  tab: z.enum(['profile', 'activity', 'bookings', 'payments']).optional().default('profile'),
}).optional();

function UserDetailWrapper() {
  const { userId } = Route.useParams();
  return <UserDetailPage userId={userId} />;
}

export const Route = createFileRoute('/_protected/users/users/$userId')({
  component: UserDetailWrapper,
  
  // Validate URL parameters
  parseParams: (params) => userParamsSchema.parse(params),
  
  // Validate search parameters  
  validateSearch: (search) => userSearchSchema.parse(search),
});