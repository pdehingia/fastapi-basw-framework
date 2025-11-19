/**
 * Artist Verification Queue Route
 * Main artist verification queue route
 */

import { createFileRoute } from '@tanstack/react-router';
import { VerificationQueue } from './VerificationQueue';

export const Route = createFileRoute('/_protected/artist-verification/')({
  component: VerificationQueue,
});