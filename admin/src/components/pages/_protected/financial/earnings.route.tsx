import { createFileRoute } from '@tanstack/react-router';
import { EarningsPage } from './EarningsPage';

export const Route = createFileRoute('/_protected/financial/earnings')({
  component: EarningsPage,
});
