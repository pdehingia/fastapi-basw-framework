/**
 * Bookings Page Route
 * Booking management and listing
 */

import { createFileRoute } from '@tanstack/react-router';
import BookingListPage from './bookingListPage';
import { z } from 'zod';

// Search parameters schema - all optional
const bookingsSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  service: z.string().optional(),
}).optional();

export const Route = createFileRoute('/_protected/bookings/')({
  component: BookingListPage,
  
  // Validate search parameters
  validateSearch: (search) => bookingsSearchSchema.parse(search),
});