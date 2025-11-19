/**
 * Artist Verification Request Detail Route
 * Individual verification request detail route
 */

import { createFileRoute } from '@tanstack/react-router';
import { VerificationDetailPage } from './VerificationDetailPage';

export const Route = createFileRoute('/_protected/artist-verification/artist-verification/$requestId')({
  component: VerificationDetailPage,
  parseParams: (params) => ({
    requestId: params.requestId,
  }),
});