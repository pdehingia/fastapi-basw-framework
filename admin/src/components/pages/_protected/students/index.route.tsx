import { createFileRoute } from '@tanstack/react-router';
import { StudentsDashboard } from './StudentsDashboard';

export const Route = createFileRoute('/_protected/students/')({
  component: StudentsDashboard,
});
