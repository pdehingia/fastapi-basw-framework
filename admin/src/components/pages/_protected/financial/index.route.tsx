import { createFileRoute } from '@tanstack/react-router';
import { FinancialDashboardPage } from './FinancialDashboardPage';

export const Route = createFileRoute('/_protected/financial/')({
  component: FinancialDashboardPage,
});
