import { createFileRoute } from '@tanstack/react-router';
import AcademyPerformancePage from './AcademyPerformancePage';

export const Route = createFileRoute('/_protected/analytics/academy')({
  component: AcademyPerformancePage,
});
