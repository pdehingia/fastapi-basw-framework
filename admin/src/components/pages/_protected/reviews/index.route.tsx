/**
 * Reviews Main Route
 * Main review management route
 */

import { createFileRoute } from '@tanstack/react-router';
import { ReviewManagement } from '../../../organisms/ReviewManagement';

export const Route = createFileRoute('/_protected/reviews/')({
  component: ReviewManagement,
});