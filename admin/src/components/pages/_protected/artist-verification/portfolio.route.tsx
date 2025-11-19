/**
 * Portfolio Moderation Route
 * Artist portfolio moderation route
 */

import { createFileRoute } from '@tanstack/react-router';
import { PortfolioModeration } from './PortfolioModeration';

export const Route = createFileRoute('/_protected/artist-verification/portfolio')({
  component: PortfolioModeration,
});