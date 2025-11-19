/**
 * Review Detail Route
 * Individual review detail route with parameter validation
 */

import { createFileRoute } from '@tanstack/react-router';
import { ReviewDetailPage } from '../../../organisms/ReviewManagement';

export const Route = createFileRoute('/_protected/reviews/reviews/$reviewId')({
  component: ReviewDetailPage,
  parseParams: (params) => ({
    reviewId: params.reviewId,
  }),
});