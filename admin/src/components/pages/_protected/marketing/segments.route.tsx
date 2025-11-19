import { createFileRoute } from '@tanstack/react-router';
import CustomerSegmentsPage from './CustomerSegmentsPage';

export const Route = createFileRoute('/_protected/marketing/segments')({
  component: CustomerSegmentsPage,
});
