import { createFileRoute } from '@tanstack/react-router';
import { AddressesDashboard } from './AddressesDashboard';

export const Route = createFileRoute('/_protected/addresses/')({
  component: AddressesDashboard,
});
