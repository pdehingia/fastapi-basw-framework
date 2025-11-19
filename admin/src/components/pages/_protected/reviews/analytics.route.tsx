/**
 * Review Analytics Route
 * Review analytics and insights route
 */

import { createFileRoute } from '@tanstack/react-router';
import { ReviewAnalyticsPage } from '../../../organisms/ReviewManagement';

export const Route = createFileRoute('/_protected/reviews/analytics')({
  component: ReviewAnalyticsPage,
});