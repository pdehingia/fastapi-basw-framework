import { createFileRoute } from '@tanstack/react-router';
import { TransactionsListPage } from './TransactionsListPage';

export const Route = createFileRoute('/_protected/financial/transactions')({
  component: TransactionsListPage,
});
