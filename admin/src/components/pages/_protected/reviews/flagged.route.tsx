/**
 * Flagged Reviews Route
 * Flagged reviews moderation route
 */

import { createFileRoute } from '@tanstack/react-router';
import { FlaggedReviews } from '../../../organisms/ReviewManagement';

export const Route = createFileRoute('/_protected/reviews/flagged')({
  component: FlaggedReviews,
});