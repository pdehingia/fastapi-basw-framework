import { createFileRoute } from '@tanstack/react-router';
import { SalonsPage } from './SalonsPage';

export const Route = createFileRoute('/_protected/content/salons')({
  component: SalonsPage,
});
